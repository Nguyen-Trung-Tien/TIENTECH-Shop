const db = require("../models");
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

const requestReturn = async (id, reason) => {
  try {
    const item = await db.OrderItem.findByPk(id, {
      include: [{ model: db.Order, as: "order" }]
    });
    if (!item) {
      return { errCode: 1, errMessage: "OrderItem not found" };
    }

    if (item.order.status !== "delivered" && item.order.status !== "completed") {
      return { errCode: 3, errMessage: "Chỉ có thể trả hàng cho đơn hàng đã giao thành công." };
    }

    if (item.returnStatus !== "none") {
      return { errCode: 2, errMessage: "Sản phẩm này đã được yêu cầu trả hàng trước đó." };
    }

    item.returnStatus = "requested";
    item.returnReason = reason;
    item.returnRequestedAt = new Date();
    await item.save();

    return { errCode: 0, errMessage: "Gửi yêu cầu trả hàng thành công", data: item };
  } catch (e) {
    console.error("Error requestReturn:", e);
    throw e;
  }
};

const cancelReturnRequest = async (id) => {
  try {
    const item = await db.OrderItem.findByPk(id);
    if (!item) {
      return { errCode: 1, errMessage: "OrderItem not found" };
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
    throw e;
  }
};

const processReturn = async (id, status, adminUser = null) => {
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

    const validStatuses = ["approved", "rejected", "completed"];
    if (!validStatuses.includes(status)) {
      await t.rollback();
      return { errCode: 2, errMessage: "Trạng thái không hợp lệ" };
    }

    const prevStatus = item.returnStatus;
    item.returnStatus = status;
    item.returnProcessedAt = new Date();
    await item.save({ transaction: t });

    const order = item.order;
    const NotificationService = require("./NotificationService");

    // 1. Gửi thông báo cho người dùng về trạng thái trả hàng
    let notifTitle = "";
    let notifContent = "";
    if (status === "approved") {
      notifTitle = "Yêu cầu trả hàng đã được chấp nhận";
      notifContent = `Yêu cầu trả hàng cho sản phẩm ${item.productName} của đơn hàng ${order.orderCode} đã được chấp nhận. Vui lòng gửi hàng về shop.`;
    } else if (status === "rejected") {
      notifTitle = "Yêu cầu trả hàng bị từ chối";
      notifContent = `Yêu cầu trả hàng cho sản phẩm ${item.productName} của đơn hàng ${order.orderCode} đã bị từ chối.`;
    } else if (status === "completed") {
      notifTitle = "Hoàn tất thủ tục trả hàng";
      notifContent = `Thủ tục trả hàng và hoàn tiền cho sản phẩm ${item.productName} của đơn hàng ${order.orderCode} đã hoàn tất.`;
    }

    if (notifTitle) {
      await NotificationService.createNotification({
        userId: order.userId,
        title: notifTitle,
        content: notifContent,
        type: "order",
        isRead: false
      }, t);
    }

    // 2. Logic khi hoàn tất trả hàng (completed)
    if (status === "completed" && prevStatus !== "completed") {
      // a. Hoàn tồn kho
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

      // b. Khấu trừ điểm thưởng tương ứng
      const userToUpdate = await db.User.findByPk(order.userId, { transaction: t });
      if (userToUpdate) {
        const pointsToDeduct = Math.floor(Number(item.subtotal) / 10000);
        if (pointsToDeduct > 0) {
          const newPoints = Math.max(0, (userToUpdate.points || 0) - pointsToDeduct);
          
          let newRank = "Bronze";
          if (newPoints >= 10000) newRank = "Platinum";
          else if (newPoints >= 5000) newRank = "Gold";
          else if (newPoints >= 1000) newRank = "Silver";

          await userToUpdate.update({
            points: newPoints,
            rank: newRank
          }, { transaction: t });
        }
      }

      // c. Hoàn tiền (Financial Reconciliation)
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
            if (!refundResult.success) {
              await t.rollback();
              return { errCode: 3, errMessage: `Lỗi hoàn tiền: ${refundResult.message}` };
            }
            refundSuccess = true;
          }

          const refundNote = `[Refund] Hoàn tiền ${refundSuccess ? "thành công" : "thủ công"} ${Number(refundAmount).toLocaleString()}đ cho sản phẩm ${item.productName} (ID: ${item.id})`;
          payment.note = payment.note ? `${payment.note}\n${refundNote}` : refundNote;
          await payment.save({ transaction: t });
        }

        // d. Kiểm tra xem tất cả items đã trả xong chưa
        const allItems = await db.OrderItem.findAll({
          where: { orderId: order.id },
          transaction: t,
        });

        const allReturned = allItems.every(
          (i) => i.id === item.id ? true : i.returnStatus === "completed"
        );

        if (allReturned) {
          order.status = "cancelled";
          order.cancelReason = "Tất cả sản phẩm đã được trả lại.";
          await order.save({ transaction: t });

          // Gọi sync side effects cho toàn bộ đơn hàng
          await OrderService.syncOrderCancellationSideEffects(
            order,
            "Tất cả sản phẩm đã được trả lại.",
            adminUser,
            t
          );
        } else {
          // Ghi lại lịch sử trả hàng một phần vào đơn hàng
          const history = Array.isArray(order.confirmationHistory) ? order.confirmationHistory : [];
          history.push({
            status: order.status,
            date: new Date().toISOString(),
            actor: adminUser?.username || "admin",
            action: `Chấp nhận trả hàng sản phẩm: ${item.productName}`
          });
          order.confirmationHistory = history;
          await order.save({ transaction: t });
        }
      }
    }

    await t.commit();
    return { errCode: 0, errMessage: "Xử lý trả hàng thành công", data: item };
  } catch (e) {
    if (t) await t.rollback();
    console.error("Error processReturn:", e);
    throw e;
  }
};

module.exports = {
  getAllOrderItems,
  getOrderItemById,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
  requestReturn,
  processReturn,
};
