const db = require("../models");
const ProductService = require("./ProductService");

// Temporary refund simulator for online methods to avoid runtime crash.
// Replace with real provider integration.
const simulateRefund = async (order, method) => {
  if (!order || !method) {
    return { success: false, message: "Missing order or method" };
  }
  return { success: true, message: "Refund simulated" };
};

const { getPagination, getPagingData } = require("../utils/paginationHelper");

const getAllPayments = async ({
  page = 1,
  limit = 10,
  status = null,
  search = "",
  orderBy = "createdAt",
  order = "DESC",
}) => {
  try {
    const { offset, limit: l } = getPagination(page, limit);

    let where = {};
    if (status && status !== "all") where.status = status;

    if (search) {
      where[db.Sequelize.Op.or] = [
        { id: { [db.Sequelize.Op.like]: `%${search}%` } },
        { orderId: { [db.Sequelize.Op.like]: `%${search}%` } },
        { "$user.username$": { [db.Sequelize.Op.like]: `%${search}%` } },
        { "$user.email$": { [db.Sequelize.Op.like]: `%${search}%` } },
      ];
    }

    const orderArray = orderBy.startsWith("user.")
      ? [[{ model: db.User, as: "user" }, orderBy.split(".")[1], order]]
      : [[orderBy, order]];

    const data = await db.Payment.findAndCountAll({
      where,
      include: [
        {
          model: db.Order,
          as: "order",
          attributes: ["id", "orderCode", "status", "totalPrice"],
          required: false,
        },
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username", "email", "phone"],
          required: false,
        },
      ],
      order: orderArray,
      limit: l,
      offset,
      distinct: true,
      subQuery: false,
    });

    const pagingData = getPagingData(data, page, l);

    return {
      errCode: 0,
      errMessage: "OK",
      data: pagingData.items,
      pagination: {
        totalItems: pagingData.totalItems,
        currentPage: pagingData.currentPage,
        totalPages: pagingData.totalPages,
        limit: l,
      },
    };
  } catch (e) {
    console.error("Error getAllPayments:", e);
    throw e;
  }
};

const getPaymentById = async (id) => {
  try {
    const payment = await db.Payment.findByPk(id, {
      include: [
        {
          model: db.Order,
          as: "order",
          attributes: ["id", "orderCode", "status", "totalPrice"],
        },
        { model: db.User, as: "user", attributes: ["id", "name", "email"] },
      ],
    });

    if (!payment) return { errCode: 1, errMessage: "Payment not found" };

    return { errCode: 0, errMessage: "OK", data: payment };
  } catch (e) {
    console.error("Error getPaymentById:", e);
    throw e;
  }
};

const createPayment = async (data, actor = null) => {
  const t = await db.sequelize.transaction();
  try {
    const { orderId, userId, amount, method, note } = data;

    if (!orderId || !amount) {
      return { errCode: 2, errMessage: "Missing required fields" };
    }

    const order = await db.Order.findByPk(orderId, { transaction: t });
    if (!order) {
      await t.rollback();
      return { errCode: 3, errMessage: "Order not found" };
    }

    if (actor && actor.role !== "admin") {
      if (order.userId !== actor.id) {
        await t.rollback();
        return { errCode: 403, errMessage: "Forbidden", status: 403 };
      }
    }

    // Nếu Order đã thanh toán hoặc hoàn tất, không tạo payment mới
    if (order.paymentStatus === "paid" || order.status === "completed") {
      await t.rollback();
      return {
        errCode: 4,
        errMessage: "Order has already been paid. Please create a new order.",
      };
    }

    // Kiểm tra Payment đã tồn tại cho order chưa
    let payment = await db.Payment.findOne({
      where: { orderId },
      transaction: t,
    });
    if (payment) {
      await t.rollback();
      return {
        errCode: 5,
        errMessage: "Payment already exists for this order",
        data: payment,
      };
    }

    const transactionId = `DH${Date.now()}${orderId}`;

    const autoPaidMethods = ["momo", "paypal", "vnpay", "bank"];
    const isAutoPaid = autoPaidMethods.includes(method);

    payment = await db.Payment.create(
      {
        orderId,
        userId: actor && actor.role !== "admin" ? actor.id : userId || order.userId,
        amount,
        method,
        note,
        transactionId,
        status: isAutoPaid ? "completed" : "pending",
      },
      { transaction: t }
    );

    if (isAutoPaid) {
      // Cập nhật trạng thái Order ngay
      order.paymentStatus = "paid";
      if (order.status === "pending") order.status = "confirmed";
      await order.save({ transaction: t });

      // Cập nhật sold & stock sản phẩm
      const orderItems = await db.OrderItem.findAll({
        where: { orderId },
        transaction: t,
      });
      for (const item of orderItems) {
        await ProductService.updateProductSold(
          item.productId,
          item.quantity,
          t
        );
      }
    }

    await t.commit();

    return {
      errCode: 0,
      errMessage: "Payment created successfully",
      data: payment,
    };
  } catch (e) {
    await t.rollback();
    console.error("Error createPayment:", e);
    return { errCode: 1, errMessage: e.message || "Internal server error" };
  }
};

const updatePayment = async (orderId, data) => {
  try {
    const order = await db.Order.findByPk(orderId);
    if (!order) return { errCode: 2, errMessage: "Order not found" };

    let payment = await db.Payment.findOne({ where: { orderId } });

    const statusMap = {
      paid: "completed",
      refunded: "refunded",
      unpaid: "pending",
    };
    const paymentStatus = statusMap[data.paymentStatus] || "pending";

    if (paymentStatus === "refunded") {
      const method = order.paymentMethod?.toLowerCase();
      const isOnlineMethod = ["momo", "paypal", "vnpay", "bank"].includes(
        method
      );

      if (isOnlineMethod) {
        const refundResult = await simulateRefund(order, method);
        if (!refundResult.success) {
          return {
            errCode: 3,
            errMessage: `Refund failed: ${refundResult.message}`,
          };
        }
      }
    }

    if (!payment) {
      payment = await db.Payment.create({
        orderId,
        userId: data.userId || order.userId,
        amount: data.amount || order.totalPrice,
        method: data.method || order.paymentMethod || "cod",
        status: paymentStatus,
        note: data.note || "",
      });
    } else {
      await payment.update({
        amount: data.amount || payment.amount,
        method: data.method || payment.method,
        status: paymentStatus,
        note: data.note || payment.note,
      });
    }

    // Cập nhật trạng thái thanh toán của Order
    const orderStatusMap = {
      completed: "paid",
      refunded: "refunded",
      pending: "unpaid",
    };
    await order.update({
      paymentStatus: orderStatusMap[paymentStatus] || "unpaid",
    });

    const updatedOrder = await db.Order.findByPk(orderId, {
      include: [{ model: db.Payment, as: "payment" }],
    });

    return {
      errCode: 0,
      errMessage: "Payment updated successfully",
      data: updatedOrder.toJSON(),
    };
  } catch (e) {
    console.error("Error updatePayment:", e);
    return { errCode: 1, errMessage: e.message || "Lỗi cập nhật thanh toán" };
  }
};

const deletePayment = async (id) => {
  try {
    const payment = await db.Payment.findByPk(id);
    if (!payment) return { errCode: 1, errMessage: "Payment not found" };
    await payment.destroy();
    return { errCode: 0, errMessage: "Payment deleted successfully" };
  } catch (e) {
    console.error("Error deletePayment:", e);
    throw e;
  }
};

const completePayment = async (id, transactionId) => {
  const t = await db.sequelize.transaction();
  try {
    const payment = await db.Payment.findByPk(id, { transaction: t });
    if (!payment) {
      await t.rollback();
      return { errCode: 1, errMessage: "Payment not found" };
    }

    payment.transactionId =
      transactionId || payment.transactionId || `DH${payment.orderId}`;

    payment.status = "completed";
    payment.paymentDate = new Date();
    await payment.save({ transaction: t });

    const order = await db.Order.findByPk(payment.orderId, {
      include: [{ model: db.OrderItem, as: "orderItems" }],
      transaction: t
    });

    if (order) {
      order.paymentStatus = "paid";
      if (order.status === "pending") order.status = "confirmed";
      await order.save({ transaction: t });

      for (const item of order.orderItems) {
        await ProductService.updateProductSold(item.productId, item.quantity, t);
      }
    }

    await t.commit();
    return { errCode: 0, errMessage: "Payment completed", data: payment };
  } catch (e) {
    await t.rollback();
    console.error("Error completePayment:", e);
    throw e;
  }
};

const refundPayment = async (id, note = "") => {
  const t = await db.sequelize.transaction();
  try {
    const payment = await db.Payment.findByPk(id, { transaction: t });
    if (!payment) {
      await t.rollback();
      return { errCode: 1, errMessage: "Payment not found" };
    }

    payment.status = "refunded";
    payment.note = note || payment.note || "";
    await payment.save({ transaction: t });

    const order = await db.Order.findByPk(payment.orderId, { transaction: t });
    if (order) {
      order.paymentStatus = "refunded";
      await order.save({ transaction: t });
    }

    await t.commit();
    return { errCode: 0, errMessage: "Payment refunded", data: payment };
  } catch (e) {
    await t.rollback();
    console.error("Error refundPayment:", e);
    return { errCode: 1, errMessage: e.message || "Error refunding payment" };
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  completePayment,
  refundPayment,
};
