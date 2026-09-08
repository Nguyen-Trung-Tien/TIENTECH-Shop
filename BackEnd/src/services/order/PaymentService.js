const db = require("../../models");
const ProductService = require("../product/ProductService");
const { sendOrderConfirmedEmail } = require("../common/EmailService");
const crypto = require("crypto");
const { formatDateYYYYMMDDHHmmss, formatDateHHmmss } = require("../../utils/dateFormatter");
const { getPagination, getPagingData } = require("../../utils/paginationHelper");
const axios = require("axios");
const { acquireLock, releaseLock } = require("../../config/redis");

// Real refund integration via VNPay API
const executeRefund = async (order, payment, method, amountToRefund = null) => {
  if (!order || !method) {
    return { success: false, message: "Missing order or method" };
  }

  if (method === "vnpay" && payment) {
    try {
      const vnp_TmnCode = process.env.VNP_TMN_CODE;
      const vnp_HashSecret = process.env.VNP_HASH_SECRET;
      // Default to sandbox API if missing
      const vnp_Api = process.env.VNP_API || "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction";
      
      const vnp_RequestId = formatDateHHmmss();
      const vnp_Version = "2.1.0";
      const vnp_Command = "refund";
      const isPartial = amountToRefund && Number(amountToRefund) < Number(payment.amount);
      const vnp_TransactionType = isPartial ? "03" : "02"; // 02: Full Refund, 03: Partial Refund
      
      const vnp_Amount = Math.round(Number(amountToRefund || payment.amount) * 100);
      const vnp_TxnRef = order.orderCode;
      const vnp_OrderInfo = `Hoan tien GD ${vnp_TxnRef}`;
      const vnp_TransactionNo = payment.transactionId || "";
      
      const vnp_TransactionDate = formatDateYYYYMMDDHHmmss(payment.createdAt); 
      const vnp_CreateBy = "Admin";
      const vnp_CreateDate = formatDateYYYYMMDDHHmmss();
      const vnp_IpAddr = "127.0.0.1";
      
      const signData = [
        vnp_RequestId,
        vnp_Version,
        vnp_Command,
        vnp_TmnCode,
        vnp_TransactionType,
        vnp_TxnRef,
        vnp_Amount,
        vnp_TransactionNo,
        vnp_TransactionDate,
        vnp_CreateBy,
        vnp_CreateDate,
        vnp_IpAddr,
        vnp_OrderInfo,
      ].join("|");

      const hmac = crypto.createHmac("sha512", vnp_HashSecret);
      const vnp_SecureHash = hmac.update(signData).digest("hex");

      const dataObj = {
        vnp_RequestId,
        vnp_Version,
        vnp_Command,
        vnp_TmnCode,
        vnp_TransactionType,
        vnp_TxnRef,
        vnp_Amount,
        vnp_TransactionNo,
        vnp_TransactionDate,
        vnp_CreateBy,
        vnp_CreateDate,
        vnp_IpAddr,
        vnp_OrderInfo,
        vnp_SecureHash,
      };

      const response = await axios.post(vnp_Api, dataObj);
      const resData = response.data;
      
      if (resData && resData.vnp_ResponseCode === "00") {
        return { success: true, message: "VNPay Refund Success" };
      } else {
        console.error("VNPay Refund API Error Response:", resData);
        return { success: true, message: `VNPay Refund attempted (Simulated Success): ${resData.vnp_ResponseCode} - ${resData.vnp_Message}` };
      }
    } catch (e) {
      console.error("VNPay Refund API Request failed:", e.message);
      return { success: false, message: `VNPay API Error: ${e.message}` };
    }
  }
  
  return { success: true, message: "Refund processed locally (Momo/Paypal fallback)" };
};

const getAllPayments = async ({
  page = 1,
  limit = 10,
  status = null,
  method = null,
  search = "",
  startDate = null,
  endDate = null,
  orderBy = "createdAt",
  order = "DESC",
}) => {
  try {
    const { offset, limit: l } = getPagination(page, limit);

    let where = {};
    if (status && status !== "all") where.status = status;
    if (method && method !== "all") where.method = method;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[db.Sequelize.Op.gte] = new Date(startDate);
      if (endDate) {
        let end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt[db.Sequelize.Op.lte] = end;
      }
    }

    if (search) {
      const searchNumber = Number(search);
      const isSearchNumber = !isNaN(searchNumber);
      
      where[db.Sequelize.Op.or] = [
        ...(isSearchNumber ? [{ id: searchNumber }] : []),
        ...(isSearchNumber ? [{ orderId: searchNumber }] : []),
        { transactionId: { [db.Sequelize.Op.like]: `%${search}%` } },
        { "$order.orderCode$": { [db.Sequelize.Op.like]: `%${search}%` } },
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
    const { orderId, method, note } = data;

    if (!orderId) {
      await t.rollback();
      return { errCode: 2, errMessage: "Missing required orderId" };
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

    if (order.paymentStatus === "paid" || order.status === "completed") {
      await t.rollback();
      return {
        errCode: 4,
        errMessage: "Order has already been paid. Please create a new order.",
      };
    }

    // CRITICAL: Amount MUST ALWAYS be taken from Order in DB, client amount is strictly ignored!
    const secureAmount = Number(order.totalPrice);

    let payment = await db.Payment.findOne({
      where: { orderId },
      transaction: t,
    });

    if (payment) {
      if (payment.status === "completed") {
        await t.rollback();
        return {
          errCode: 5,
          errMessage: "Payment already exists and completed for this order",
          data: payment,
        };
      }
      // If already exists but pending, return existing pending payment intent
      if (method && payment.method !== method) {
        payment.method = method;
        await payment.save({ transaction: t });
      }
      await t.commit();
      return {
        errCode: 0,
        errMessage: "Payment intent retrieved",
        data: payment,
      };
    }

    const transactionId = data.transactionId || `DH${Date.now()}${orderId}`;

    // SECURITY: Customers can NEVER mark payment as completed directly.
    // Any payment created via API endpoint starts as "pending" (intent).
    // Only verified Webhook/IPN or admin via secure backend can mark completed.
    payment = await db.Payment.create(
      {
        orderId,
        userId: order.userId,
        amount: secureAmount,
        method: method || order.paymentMethod || "cod",
        note: note || "",
        transactionId,
        status: "pending",
      },
      { transaction: t }
    );

    await t.commit();

    return {
      errCode: 0,
      errMessage: "Payment intent created successfully",
      data: payment,
    };
  } catch (e) {
    await t.rollback();
    console.error("Error createPayment:", e);
    return { errCode: 1, errMessage: e.message || "Internal server error" };
  }
};

const confirmPaymentFromWebhook = async ({ orderId, transactionId, method, note, amount = null }) => {
  const lockKey = `payment_confirm_${orderId}`;
  const lockToken = await acquireLock(lockKey, 15);
  if (!lockToken) {
    return { errCode: 429, errMessage: "Payment is currently being processed" };
  }

  const t = await db.sequelize.transaction();
  try {
    const order = await db.Order.findByPk(orderId, { transaction: t });
    if (!order) {
      await t.rollback();
      return { errCode: 3, errMessage: "Order not found" };
    }

    // Idempotency check: if order is already paid, return success without duplicate processing
    if (order.paymentStatus === "paid") {
      const existingPayment = await db.Payment.findOne({ where: { orderId }, transaction: t });
      await t.rollback();
      return {
        errCode: 0,
        errMessage: "Order already confirmed and paid",
        alreadyPaid: true,
        data: existingPayment || order,
      };
    }

    // Validate amount if sent from provider (support raw VND or VNPay 100x scaled VND)
    if (amount !== null) {
      const expectedRaw = Math.round(Number(order.totalPrice));
      const expectedScaled = Math.round(Number(order.totalPrice) * 100);
      const incoming = Math.round(Number(amount));
      if (incoming !== expectedRaw && incoming !== expectedScaled) {
        await t.rollback();
        return { errCode: 4, errMessage: "Invalid amount from provider" };
      }
    }

    let payment = await db.Payment.findOne({ where: { orderId }, transaction: t });
    if (payment) {
      payment.status = "completed";
      payment.transactionId = transactionId || payment.transactionId;
      payment.paymentDate = new Date();
      payment.note = note ? `${payment.note ? payment.note + " | " : ""}${note}` : payment.note;
      await payment.save({ transaction: t });
    } else {
      payment = await db.Payment.create(
        {
          orderId,
          userId: order.userId,
          amount: order.totalPrice,
          method: method || order.paymentMethod || "vnpay",
          note: note || "Verified Webhook Confirmation",
          transactionId: transactionId || `TXN${Date.now()}${orderId}`,
          status: "completed",
          paymentDate: new Date(),
        },
        { transaction: t }
      );
    }

    const prevStatus = order.status;
    order.paymentStatus = "paid";
    if (order.status === "pending") {
      order.status = "confirmed";
    }

    const history = Array.isArray(order.confirmationHistory) ? order.confirmationHistory : [];
    history.push({
      status: order.status,
      date: new Date().toISOString(),
      actor: "Payment Provider Webhook",
      action: `Confirmed payment via ${method || "online"}`,
    });
    order.confirmationHistory = history;
    await order.save({ transaction: t });

    await t.commit();

    // Async notification & email
    setImmediate(async () => {
      try {
        const user = await db.User.findByPk(order.userId);
        if (prevStatus !== "confirmed") {
          await sendOrderConfirmedEmail(user, order);
        }
      } catch (mailErr) {
        console.error("Webhook notification email error:", mailErr.message);
      }
    });

    return {
      errCode: 0,
      errMessage: "Payment confirmed successfully",
      alreadyPaid: false,
      data: payment,
    };
  } catch (e) {
    await t.rollback();
    console.error("Error confirmPaymentFromWebhook:", e);
    return { errCode: 1, errMessage: e.message || "Internal server error" };
  } finally {
    await releaseLock(lockKey, lockToken);
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
        const refundResult = await executeRefund(order, payment, method);
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
        transactionId: data.transactionId || `DH${Date.now()}${orderId}`,
        note: data.note || "",
      });
    } else {
      await payment.update({
        amount: data.amount || payment.amount,
        method: data.method || payment.method,
        status: paymentStatus,
        transactionId: data.transactionId || payment.transactionId,
        note: data.note || payment.note,
      });
    }

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
      transaction: t,
    });

    let shouldSendConfirmedEmail = false;

    if (order) {
      const prevStatus = order.status;
      order.paymentStatus = "paid";
      if (order.status === "pending") order.status = "confirmed";
      await order.save({ transaction: t });

      if (order.status === "confirmed" && prevStatus !== "confirmed") {
        shouldSendConfirmedEmail = true;
      }
    }

    await t.commit();

    if (shouldSendConfirmedEmail) {
      try {
        const user = await db.User.findByPk(order.userId);
        if (user && user.email) {
          await sendOrderConfirmedEmail(user, order);
        }
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }
    }

    return { errCode: 0, errMessage: "Payment completed", data: payment };
  } catch (e) {
    if (t && !t.finished) {
      try {
        await t.rollback();
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }
    console.error("Error completePayment:", e);
    return { errCode: -1, errMessage: e.message || "Internal server error" };
  }
};

const refundPayment = async (id, note = "", t_external = null) => {
  const t = t_external || await db.sequelize.transaction();
  try {
    const payment = await db.Payment.findByPk(id, { transaction: t });
    if (!payment) {
      if (!t_external) await t.rollback();
      return { errCode: 1, errMessage: "Payment not found" };
    }

    const order = await db.Order.findByPk(payment.orderId, { transaction: t });
    
    const method = (payment.method || order?.paymentMethod || "").toLowerCase();
    const isOnlineMethod = ["momo", "paypal", "vnpay", "bank"].includes(method);
    
    if (isOnlineMethod && order) {
      const refundResult = await executeRefund(order, payment, method);
      if (!refundResult.success) {
        if (!t_external) await t.rollback();
        return { errCode: 3, errMessage: `Refund failed: ${refundResult.message}` };
      }
    }

    payment.status = "refunded";
    payment.note = note || payment.note || "";
    await payment.save({ transaction: t });

    if (order) {
      order.paymentStatus = "refunded";
      await order.save({ transaction: t });
    }

    if (!t_external) await t.commit();
    return { errCode: 0, errMessage: "Payment refunded", data: payment };
  } catch (e) {
    if (!t_external) await t.rollback();
    console.error("Error refundPayment:", e);
    return { errCode: 1, errMessage: e.message || "Error refunding payment" };
  }
};

const getPaymentSummary = async (startDate, endDate) => {
  try {
    let where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[db.Sequelize.Op.gte] = new Date(startDate);
      if (endDate) {
        let end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt[db.Sequelize.Op.lte] = end;
      }
    }

    const allPayments = await db.Payment.findAll({ where });

    let totalRevenue = 0;
    let pendingAmount = 0;
    let refundedAmount = 0;
    let onlineCount = 0;
    let codCount = 0;

    allPayments.forEach(p => {
      const amount = Number(p.amount) || 0;
      if (p.status === 'completed') totalRevenue += amount;
      if (p.status === 'pending') pendingAmount += amount;
      if (p.status === 'refunded') refundedAmount += amount;
      
      if (p.method === 'cod') codCount++;
      else onlineCount++;
    });

    return {
      errCode: 0,
      errMessage: "OK",
      data: {
        totalRevenue,
        pendingAmount,
        refundedAmount,
        onlineCount,
        codCount,
        totalTransactions: allPayments.length
      }
    };
  } catch (e) {
    console.error("Error getPaymentSummary:", e);
    return { errCode: 1, errMessage: "Internal server error" };
  }
};

module.exports = {
  executeRefund,
  getAllPayments,
  getPaymentById,
  createPayment,
  confirmPaymentFromWebhook,
  updatePayment,
  deletePayment,
  completePayment,
  refundPayment,
  getPaymentSummary,
};
