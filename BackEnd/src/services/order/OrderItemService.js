const db = require("../../models");
const OrderService = require("./OrderService");

const getAllOrderItems = async () => {
  try {
    const orderItems = await db.OrderItem.findAll({
      include: [
        {
          model: db.Order,
          as: "order",
          attributes: [
            "id",
            "status",
            "confirmationHistory",
            "shippingAddress",
            "orderDate",
          ],
        },
        {
          model: db.Product,
          as: "product",
          attributes: ["id", "name", "basePrice"],
          include: [
            {
              model: db.ProductImage,
              as: "images",
              attributes: ["imageUrl", "isPrimary"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const data = orderItems.map((item) => {
      const it = item.toJSON();
      if (it.product) {
        const primaryImage = it.product.images?.find(img => img.isPrimary) || it.product.images?.[0];
        it.product.image = primaryImage ? primaryImage.imageUrl : null;
        it.product.price = it.product.basePrice;
      }
      return it;
    });

    return { errCode: 0, errMessage: "OK", data };
  } catch (e) {
    console.error("Error getAllOrderItems:", e);
    throw e;
  }
};

const getOrderItemById = async (id) => {
  try {
    const item = await db.OrderItem.findByPk(id, {
      include: [
        {
          model: db.Order,
          as: "order",
          attributes: [
            "id",
            "status",
            "confirmationHistory",
            "shippingAddress",
            "orderDate",
          ],
        },
        {
          model: db.Product,
          as: "product",
          attributes: ["id", "name", "basePrice"],
          include: [
            {
              model: db.ProductImage,
              as: "images",
              attributes: ["imageUrl", "isPrimary"],
            },
          ],
        },
      ],
    });

    if (!item) {
      return { errCode: 1, errMessage: "OrderItem not found" };
    }

    const it = item.toJSON();
    if (it.product) {
      const primaryImage = it.product.images?.find(img => img.isPrimary) || it.product.images?.[0];
      it.product.image = primaryImage ? primaryImage.imageUrl : null;
      it.product.price = it.product.basePrice;
    }

    return { errCode: 0, errMessage: "OK", data: it };
  } catch (e) {
    console.error("Error getOrderItemById:", e);
    throw e;
  }
};

const createOrderItem = async (data) => {
  try {
    const {
      orderId,
      productId,
      quantity,
      price,
      subtotal,
      productName,
      image,
    } = data;

    const newItem = await db.OrderItem.create({
      orderId,
      productId,
      quantity,
      price,
      subtotal,
      productName,
      image: image ? Buffer.from(image.split(",")[1], "base64") : null,
    });

    return {
      errCode: 0,
      errMessage: "OrderItem created successfully",
      data: newItem,
    };
  } catch (e) {
    console.error("Error createOrderItem:", e);
    throw e;
  }
};

const updateOrderItem = async (id, data) => {
  try {
    const item = await db.OrderItem.findByPk(id);
    if (!item) {
      return { errCode: 1, errMessage: "OrderItem not found" };
    }

    await item.update(data);
    return {
      errCode: 0,
      errMessage: "OrderItem updated successfully",
      data: item,
    };
  } catch (e) {
    console.error("Error updateOrderItem:", e);
    throw e;
  }
};

const deleteOrderItem = async (id) => {
  try {
    const item = await db.OrderItem.findByPk(id);
    if (!item) {
      return { errCode: 1, errMessage: "OrderItem not found" };
    }

    await item.destroy();
    return { errCode: 0, errMessage: "OrderItem deleted successfully" };
  } catch (e) {
    console.error("Error deleteOrderItem:", e);
    throw e;
  }
};

const requestReturn = async (id, reason, user = null) => {
  try {
    const item = await db.OrderItem.findByPk(id, {
      include: [{ model: db.Order, as: "order" }],
    });
    if (!item) {
      return { errCode: 1, errMessage: "OrderItem not found" };
    }

    if (user && user.role !== "admin" && item.order.userId !== user.id) {
      return { errCode: 403, errMessage: "Bạn chỉ có thể yêu cầu trả hàng cho đơn hàng của chính mình.", status: 403 };
    }

    if (item.order.status !== "delivered" && item.order.status !== "completed") {
      return { errCode: 3, errMessage: "Chỉ có thể trả hàng cho đơn hàng đã giao thành công." };
    }

    if (item.returnStatus !== "none") {
      return { errCode: 2, errMessage: "Sản phẩm này đã được yêu cầu trả hàng trước đó." };
    }

    item.returnStatus = "requested";
    item.returnReason = reason || "Khách hàng yêu cầu trả hàng";
    item.returnRequestedAt = new Date();
    await item.save();

    return { errCode: 0, errMessage: "Gửi yêu cầu trả hàng thành công", data: item };
  } catch (e) {
    console.error("Error requestReturn:", e);
    return { errCode: -1, errMessage: e.message || "Internal server error" };
  }
};

const cancelReturnRequest = async (id, user = null) => {
  try {
    const item = await db.OrderItem.findByPk(id, {
      include: [{ model: db.Order, as: "order" }],
    });
    if (!item) {
      return { errCode: 1, errMessage: "OrderItem not found" };
    }

    if (user && user.role !== "admin" && item.order.userId !== user.id) {
      return { errCode: 403, errMessage: "Forbidden", status: 403 };
    }

    if (item.returnStatus !== "requested") {
      return { errCode: 2, errMessage: "Chỉ có thể thu hồi yêu cầu khi đang ở trạng thái 'requested'." };
    }

    const requestedAt = new Date(item.returnRequestedAt);
    const now = new Date();
    const diffHours = (now - requestedAt) / (1000 * 60 * 60);

    if (diffHours > 12) {
      return { errCode: 3, errMessage: "Đã quá thời hạn 12 giờ để thu hồi yêu cầu trả hàng." };
    }

    item.returnStatus = "none";
    item.returnReason = null;
    item.returnRequestedAt = null;
    await item.save();

    return { errCode: 0, errMessage: "Thu hồi yêu cầu trả hàng thành công", data: item };
  } catch (e) {
    console.error("Error cancelReturnRequest:", e);
    return { errCode: -1, errMessage: e.message || "Internal server error" };
  }
};

const processReturn = async (id, statusOrAction, adminUser = null) => {
  const t = await db.sequelize.transaction();
  try {
    const item = await db.OrderItem.findByPk(id, {
      include: [{ model: db.Order, as: "order" }],
      transaction: t,
    });

    if (!item) {
      await t.rollback();
      return { errCode: 1, errMessage: "OrderItem not found" };
    }

    // REQUIREMENT: Admin chỉ approve/reject item đang ở trạng thái requested
    if (item.returnStatus !== "requested") {
      await t.rollback();
      return { errCode: 2, errMessage: "Chỉ có thể duyệt hoặc từ chối sản phẩm đang ở trạng thái 'requested'." };
    }

    const isApprove = ["approved", "approve", "completed"].includes(statusOrAction);
    const isReject = ["rejected", "reject"].includes(statusOrAction);

    if (!isApprove && !isReject) {
      await t.rollback();
      return { errCode: 2, errMessage: "Hành động hoặc trạng thái không hợp lệ" };
    }

    const targetStatus = isApprove ? "approved" : "rejected";
    item.returnStatus = targetStatus;
    item.returnProcessedAt = new Date();
    await item.save({ transaction: t });

    const order = item.order;
    const NotificationService = require("../notification/NotificationService");

    if (isApprove) {
      // 1. Restock kho đúng một lần
      const product = await db.Product.findByPk(item.productId, { transaction: t });
      if (product) {
        product.totalStock = (product.totalStock || 0) + item.quantity;
        product.sold = Math.max(0, (product.sold || 0) - item.quantity);
        await product.save({ transaction: t });
      }

      if (item.variantId) {
        const variant = await db.ProductVariant.findByPk(item.variantId, { transaction: t });
        if (variant) {
          variant.stock = (variant.stock || 0) + item.quantity;
          await variant.save({ transaction: t });
        }
      }

      // 2. Khấu trừ điểm thưởng nếu có
      const userToUpdate = await db.User.findByPk(order.userId, { transaction: t });
      if (userToUpdate) {
        const pointsToDeduct = Math.floor(Number(item.subtotal) / 10000);
        if (pointsToDeduct > 0) {
          const newPoints = Math.max(0, (userToUpdate.points || 0) - pointsToDeduct);
          let newRank = "Bronze";
          if (newPoints >= 10000) newRank = "Platinum";
          else if (newPoints >= 5000) newRank = "Gold";
          else if (newPoints >= 1000) newRank = "Silver";

          await userToUpdate.update({ points: newPoints, rank: newRank }, { transaction: t });
        }
      }

      // 3. Hoàn tiền nếu đơn hàng đã thanh toán
      if (order.paymentStatus === "paid") {
        const refundAmount = item.subtotal;
        const payment = await db.Payment.findOne({
          where: { orderId: order.id },
          transaction: t,
        });

        if (payment) {
          const method = (payment.method || order.paymentMethod || "").toLowerCase();
          const isOnlineMethod = ["momo", "paypal", "vnpay", "bank"].includes(method);
          let refundSuccess = false;

          if (isOnlineMethod) {
            const PaymentService = require("./PaymentService");
            const refundResult = await PaymentService.executeRefund(order, payment, method, refundAmount);
            if (refundResult && refundResult.success) {
              refundSuccess = true;
            }
          }

          const refundNote = `[Refund] Hoàn tiền ${refundSuccess ? "tự động" : "ghi nhận"} ${Number(refundAmount).toLocaleString()}đ cho sản phẩm ${item.productName} (ID: ${item.id})`;
          payment.note = payment.note ? `${payment.note}\n${refundNote}` : refundNote;
          await payment.save({ transaction: t });
        }
      }

      // 4. Kiểm tra xem tất cả items trong đơn đã được duyệt trả chưa
      const allItems = await db.OrderItem.findAll({
        where: { orderId: order.id },
        transaction: t,
      });

      const allReturned = allItems.every((i) =>
        i.id === item.id ? true : (i.returnStatus === "approved" || i.returnStatus === "completed")
      );

      if (allReturned) {
        order.status = "cancelled";
        order.cancelReason = "Tất cả sản phẩm đã được trả lại.";
        const history = Array.isArray(order.confirmationHistory) ? order.confirmationHistory : [];
        history.push({
          status: "cancelled",
          date: new Date().toISOString(),
          actor: adminUser?.username || "Admin",
          action: "Tất cả sản phẩm đã được trả lại.",
        });
        order.confirmationHistory = history;
        await order.save({ transaction: t });
      }

      // Gửi thông báo cho khách hàng
      await NotificationService.createNotification({
        userId: order.userId,
        title: "Yêu cầu trả hàng đã được chấp nhận",
        message: `Yêu cầu trả hàng cho sản phẩm ${item.productName} của đơn hàng #${order.orderCode} đã được duyệt thành công.`,
        type: "order",
      }, t);
    } else {
      // Từ chối trả hàng
      await NotificationService.createNotification({
        userId: order.userId,
        title: "Yêu cầu trả hàng bị từ chối",
        message: `Yêu cầu trả hàng cho sản phẩm ${item.productName} của đơn hàng #${order.orderCode} đã bị từ chối.`,
        type: "order",
      }, t);
    }

    await t.commit();
    return {
      errCode: 0,
      errMessage: isApprove ? "Duyệt yêu cầu trả hàng thành công" : "Từ chối yêu cầu trả hàng thành công",
      data: item,
    };
  } catch (e) {
    if (t) await t.rollback();
    console.error("Error processReturn:", e);
    return { errCode: -1, errMessage: e.message || "Internal server error" };
  }
};

module.exports = {
  getAllOrderItems,
  getOrderItemById,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
  requestReturn,
  cancelReturnRequest,
  processReturn,
};
