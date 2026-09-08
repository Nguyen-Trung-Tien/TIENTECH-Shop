const db = require("../../../models");
const NotificationService = require("../../notification/NotificationService");

const VALID_ADMIN_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "shipped", "shipping", "cancelled"],
  processing: ["shipped", "shipping", "cancelled"],
  shipped: ["shipping", "delivered", "cancelled"],
  shipping: ["delivered", "cancelled"],
  delivered: ["completed"],
  cancel_requested: ["cancelled", "confirmed"],
  completed: [],
  cancelled: [],
};

const validateCustomerStatusTransition = (currentStatus, targetStatus) => {
  if (targetStatus === "cancelled" || targetStatus === "cancel_requested") {
    if (currentStatus === "pending") {
      return { valid: true, resolvedStatus: "cancelled" };
    }
    if (["confirmed", "processing", "shipped", "shipping"].includes(currentStatus)) {
      return { valid: true, resolvedStatus: "cancel_requested" };
    }
    return {
      valid: false,
      message: `Không thể hủy đơn hàng ở trạng thái ${currentStatus}.`,
    };
  }

  if (targetStatus === "completed") {
    if (currentStatus === "delivered") {
      return { valid: true, resolvedStatus: "completed" };
    }
    return {
      valid: false,
      message: "Khách hàng chỉ có thể xác nhận hoàn thành khi đơn hàng đã giao (delivered).",
    };
  }

  return {
    valid: false,
    message: "Khách hàng không có quyền chuyển sang trạng thái này.",
  };
};

const validateAdminStatusTransition = (currentStatus, targetStatus) => {
  if (currentStatus === "cancel_requested") {
    if (["cancelled", "confirmed", "processing"].includes(targetStatus)) {
      return { valid: true };
    }
    return {
      valid: false,
      message: "Từ trạng thái cancel_requested, Admin chỉ có thể duyệt (cancelled) hoặc từ chối (confirmed/processing).",
    };
  }

  const allowed = VALID_ADMIN_TRANSITIONS[currentStatus] || [];
  if (allowed.includes(targetStatus)) {
    return { valid: true };
  }
  return {
    valid: false,
    message: `Invalid transition from ${currentStatus} to ${targetStatus}`,
  };
};

const syncOrderCancellationSideEffects = async (
  order,
  cancelReason,
  adminUser = null,
  t_external = null
) => {
  const t = t_external || (await db.sequelize.transaction());
  try {
    const orderItems = await db.OrderItem.findAll({
      where: { orderId: order.id },
      transaction: t,
    });

    for (const item of orderItems) {
      const product = await db.Product.findByPk(item.productId, {
        transaction: t,
      });
      if (product) {
        product.totalStock = (product.totalStock || 0) + item.quantity;
        product.sold = Math.max(0, (product.sold || 0) - item.quantity);
        await product.save({ transaction: t });
      }

      if (item.variantId) {
        const variant = await db.ProductVariant.findByPk(item.variantId, {
          transaction: t,
        });
        if (variant) {
          variant.stock = (variant.stock || 0) + item.quantity;
          await variant.save({ transaction: t });
        }
      }
    }

    if (order.voucherCode) {
      const voucher = await db.Voucher.findOne({
        where: { code: order.voucherCode },
        transaction: t,
      });
      if (voucher) {
        voucher.usedCount = Math.max(0, (voucher.usedCount || 0) - 1);
        await voucher.save({ transaction: t });
      }
      await db.VoucherUsage.update(
        { status: "cancelled" },
        { where: { orderId: order.id }, transaction: t }
      );
    }

    const history = Array.isArray(order.confirmationHistory)
      ? order.confirmationHistory
      : [];
    history.push({
      status: "cancelled",
      date: new Date().toISOString(),
      actor: adminUser
        ? adminUser.name || adminUser.username || adminUser.email || "Admin"
        : "customer",
      reason: cancelReason,
    });
    order.confirmationHistory = history;
    order.cancelReason = cancelReason;
    await order.save({ transaction: t });

    if (order.paymentStatus === "paid") {
      const payment = await db.Payment.findOne({
        where: { orderId: order.id },
        transaction: t,
      });
      if (payment) {
        const PaymentService = require("./PaymentService");
        await PaymentService.refundPayment(
          payment.id,
          `Order Cancelled: ${cancelReason}`,
          t
        );
      }
    }

    if (!t_external) await t.commit();
  } catch (error) {
    if (!t_external) await t.rollback();
    console.error("Error in syncOrderCancellationSideEffects:", error);
    throw error;
  }
};

const updateOrderStatus = async (
  id,
  status,
  currentUser = null,
  cancelReason = ""
) => {
  const t = await db.sequelize.transaction();
  try {
    const order = await db.Order.findByPk(id, {
      include: [{ model: db.OrderItem, as: "orderItems" }],
      transaction: t,
    });
    if (!order) {
      await t.rollback();
      return { errCode: 1, errMessage: "Order not found" };
    }

    const currentStatus = order.status;
    const isCustomer = currentUser && currentUser.role !== "admin";

    // 1. CUSTOMER STATE MACHINE
    if (isCustomer) {
      if (order.userId !== currentUser.id) {
        await t.rollback();
        return { errCode: 403, errMessage: "Forbidden", status: 403 };
      }

      if (status === "cancelled" || status === "cancel_requested") {
        if (currentStatus === "pending") {
          order.status = "cancelled";
          await syncOrderCancellationSideEffects(
            order,
            cancelReason || "Khách hàng hủy đơn.",
            currentUser,
            t
          );
          await t.commit();
          return {
            errCode: 0,
            errMessage: "Đã hủy đơn hàng thành công.",
            data: order,
          };
        } else if (
          ["confirmed", "processing", "shipped", "shipping"].includes(
            currentStatus
          )
        ) {
          order.status = "cancel_requested";
          order.cancelReason =
            cancelReason || "Khách hàng gửi yêu cầu hủy đơn.";
          const history = Array.isArray(order.confirmationHistory)
            ? order.confirmationHistory
            : [];
          history.push({
            status: "cancel_requested",
            date: new Date().toISOString(),
            actor:
              currentUser?.name ||
              currentUser?.username ||
              currentUser?.email ||
              "Khách hàng",
            reason: cancelReason,
          });
          order.confirmationHistory = history;
          await order.save({ transaction: t });
          await t.commit();

          await NotificationService.createNotification({
            userId: order.userId,
            title: "Yêu cầu hủy đơn hàng đã gửi",
            message: `Yêu cầu hủy đơn hàng ${order.orderCode} đã được gửi đến Admin để chờ xử lý.`,
            type: "order",
          });

          return {
            errCode: 0,
            errMessage: "Đã gửi yêu cầu hủy đơn hàng đến Admin.",
            data: order,
          };
        } else if (currentStatus === "cancel_requested") {
          await t.rollback();
          return {
            errCode: 2,
            errMessage:
              "Đơn hàng đã được gửi yêu cầu hủy trước đó, vui lòng chờ Admin xử lý.",
          };
        } else if (currentStatus === "cancelled") {
          await t.rollback();
          return {
            errCode: 2,
            errMessage: "Đơn hàng này đã bị hủy trước đó.",
          };
        } else {
          await t.rollback();
          return {
            errCode: 2,
            errMessage: `Không thể hủy đơn hàng ở trạng thái ${currentStatus}.`,
          };
        }
      } else if (status === "completed") {
        // Customer can ONLY confirm completed from delivered (STRICT REQUIREMENT: NO completed from shipped/shipping)
        if (currentStatus === "delivered") {
          order.status = "completed";
        } else {
          await t.rollback();
          return {
            errCode: 2,
            errMessage:
              "Khách hàng chỉ có thể xác nhận đã nhận hàng khi đơn ở trạng thái 'delivered'.",
          };
        }
      } else {
        await t.rollback();
        return {
          errCode: 2,
          errMessage: "Khách hàng không có quyền chuyển sang trạng thái này.",
        };
      }
    } else {
      // 2. ADMIN STATE MACHINE
      if (currentStatus === "cancel_requested") {
        if (status === "cancelled") {
          // Admin approves cancellation
          order.status = "cancelled";
          await syncOrderCancellationSideEffects(
            order,
            cancelReason || "Admin chấp thuận yêu cầu hủy đơn.",
            currentUser,
            t
          );
        } else if (status === "confirmed") {
          // Admin rejects cancellation -> revert back to confirmed
          order.status = "confirmed";
          order.cancelReason = null;
          const history = Array.isArray(order.confirmationHistory)
            ? order.confirmationHistory
            : [];
          history.push({
            status: "confirmed",
            date: new Date().toISOString(),
            actor: currentUser?.username || "Admin",
            reason: cancelReason || "Admin từ chối yêu cầu hủy đơn hàng",
          });
          order.confirmationHistory = history;
        } else {
          await t.rollback();
          return {
            errCode: 2,
            errMessage:
              "Từ trạng thái cancel_requested, Admin chỉ có thể duyệt (cancelled) hoặc từ chối (confirmed).",
          };
        }
      } else {
        if (!VALID_ADMIN_TRANSITIONS[currentStatus]?.includes(status)) {
          await t.rollback();
          return {
            errCode: 2,
            errMessage: `Invalid transition from ${currentStatus} to ${status}`,
          };
        }

        order.status = status;
        if (status === "cancelled") {
          await syncOrderCancellationSideEffects(
            order,
            cancelReason || "Admin hủy đơn.",
            currentUser,
            t
          );
        }
      }
    }

    // When order is delivered or completed, ensure payment status is paid
    if (["delivered", "completed"].includes(status)) {
      order.paymentStatus = "paid";
      if (!order.deliveredAt) {
        order.deliveredAt = new Date();
      }

      const existingPayment = await db.Payment.findOne({
        where: { orderId: order.id },
        transaction: t,
      });

      if (existingPayment) {
        await existingPayment.update(
          {
            status: "completed",
            paymentDate: existingPayment.paymentDate || new Date(),
          },
          { transaction: t }
        );
      } else {
        await db.Payment.create(
          {
            orderId: order.id,
            userId: order.userId,
            amount: order.totalPrice,
            method: order.paymentMethod || "cod",
            status: "completed",
            paymentDate: new Date(),
          },
          { transaction: t }
        );
      }
    }

    const history = Array.isArray(order.confirmationHistory)
      ? order.confirmationHistory
      : [];
    history.push({
      status,
      date: new Date().toISOString(),
      actor: currentUser ? currentUser.username || currentUser.email : "system",
      reason: cancelReason || "",
    });
    order.confirmationHistory = history;

    await order.save({ transaction: t });
    await t.commit();

    return {
      errCode: 0,
      errMessage: "Update order status successfully",
      data: order,
    };
  } catch (error) {
    await t.rollback();
    console.error("Error in updateOrderStatus:", error);
    return { errCode: 2, errMessage: error.message || "Lỗi hệ thống." };
  }
};

const deleteOrder = async (id) => {
  try {
    const order = await db.Order.findByPk(id);
    if (!order) {
      return { errCode: 1, errMessage: "Order not found" };
    }
    await order.destroy();
    return { errCode: 0, errMessage: "Delete order successfully" };
  } catch (e) {
    console.error("Error in deleteOrder:", e);
    throw e;
  }
};

const updatePaymentStatus = async (id, paymentStatus) => {
  const t = await db.sequelize.transaction();
  try {
    const order = await db.Order.findByPk(id, { transaction: t });
    if (!order) {
      await t.rollback();
      return { errCode: 1, errMessage: "Order not found" };
    }

    order.paymentStatus = paymentStatus;
    if (paymentStatus === "paid" && order.status === "pending") {
      order.status = "confirmed";
    }

    const payment = await db.Payment.findOne({
      where: { orderId: order.id },
      transaction: t,
    });

    if (payment) {
      if (paymentStatus === "paid") {
        payment.status = "completed";
        payment.paymentDate = new Date();
      } else if (paymentStatus === "refunded") {
        payment.status = "refunded";
      } else {
        payment.status = "pending";
      }
      await payment.save({ transaction: t });
    }

    await order.save({ transaction: t });
    await t.commit();

    return {
      errCode: 0,
      errMessage: "Update payment status successfully",
      data: order,
    };
  } catch (e) {
    await t.rollback();
    console.error("Error in updatePaymentStatus:", e);
    return { errCode: 2, errMessage: e.message || "Internal server error" };
  }
};

module.exports = {
  VALID_ADMIN_TRANSITIONS,
  validateCustomerStatusTransition,
  validateAdminStatusTransition,
  syncOrderCancellationSideEffects,
  updateOrderStatus,
  deleteOrder,
  updatePaymentStatus,
};
