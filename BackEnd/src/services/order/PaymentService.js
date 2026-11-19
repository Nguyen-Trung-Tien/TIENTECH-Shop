const db = require("../../models");
const ProductService = require("../product/ProductService");
const { sendOrderConfirmedEmail } = require("../common/EmailService");
const crypto = require("crypto");
const { formatDateYYYYMMDDHHmmss, formatDateHHmmss } = require("../../utils/dateFormatter");
const { getPagination, getPagingData } = require("../../utils/paginationHelper");
const axios = require("axios");
const { acquireLock, releaseLock, deleteCacheByPattern } = require("../../config/redis");
const PaypalService = require("./PaypalService");

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
        return {
          success: false,
          message: `VNPay Refund Failed: ${resData?.vnp_ResponseCode || "UNKNOWN"} - ${resData?.vnp_Message || "No details"}`,
        };
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

    const ALLOWED_PAYMENT_ORDER_BY = new Set([
      "id",
      "amount",
      "status",
      "method",
      "paymentDate",
      "createdAt",
      "updatedAt",
      "user.username",
      "user.email",
    ]);
    const safeOrderBy = ALLOWED_PAYMENT_ORDER_BY.has(orderBy) ? orderBy : "createdAt";
    const safeOrder = String(order || "").toUpperCase() === "ASC" ? "ASC" : "DESC";

    const orderArray = safeOrderBy.startsWith("user.")
      ? [[{ model: db.User, as: "user" }, safeOrderBy.split(".")[1], safeOrder]]
      : [[safeOrderBy, safeOrder]];

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

    const items = pagingData.items.map((paymentInstance) => {
      const p = typeof paymentInstance.toJSON === "function" ? paymentInstance.toJSON() : { ...paymentInstance };
      if (!p.transactionId) {
        p.transactionId = p.order?.orderCode
          ? `DH${p.order.orderCode.replace(/^#?ORD/i, "")}`
          : `DH${p.orderId || p.id}`;
      }
      return p;
    });

    return {
      errCode: 0,
      errMessage: "OK",
      data: items,
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
        { model: db.User, as: "user", attributes: ["id", "username", "email", "phone"] },
      ],
    });

    if (!payment) return { errCode: 1, errMessage: "Payment not found" };

    if (!payment.transactionId) {
      payment.transactionId = payment.order?.orderCode
        ? `DH${payment.order.orderCode.replace(/^#?ORD/i, "")}`
        : `DH${payment.orderId || payment.id}`;
    }

    return { errCode: 0, errMessage: "OK", data: payment };
  } catch (e) {
    console.error("Error getPaymentById:", e);
    throw e;
  }
};

const createPayment = async (data, actor = null) => {
  const t = await db.sequelize.transaction();
  try {
    const { orderId, note } = data;
    const method = data.method || data.paymentMethod;

    if (!orderId) {
      await t.rollback();
      return { errCode: 2, errMessage: "Missing required orderId" };
    }

    const order = await db.Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!order) {
      await t.rollback();
      return { errCode: 3, errMessage: "Order not found" };
    }

    if (order.status === "cancelled") {
      await t.rollback();
      return { errCode: 5, errMessage: "Order has been cancelled" };
    }

    if (actor && !["admin", "root"].includes(actor.role)) {
      if (String(order.userId) !== String(actor.id)) {
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
    const order = await db.Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!order) {
      await t.rollback();
      return { errCode: 3, errMessage: "Order not found" };
    }

    if (order.status === "cancelled") {
      await t.rollback();
      return { errCode: 5, errMessage: "Order has been cancelled" };
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
  const t = await db.sequelize.transaction();
  try {
    const order = await db.Order.findByPk(orderId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!order) {
      await t.rollback();
      return { errCode: 2, errMessage: "Order not found" };
    }

    let payment = await db.Payment.findOne({
      where: { orderId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

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
          await t.rollback();
          return {
            errCode: 3,
            errMessage: `Refund failed: ${refundResult.message}`,
          };
        }
      }
    }

    if (!payment) {
      payment = await db.Payment.create(
        {
          orderId,
          userId: data.userId || order.userId,
          amount: data.amount || order.totalPrice,
          method: data.method || order.paymentMethod || "cod",
          status: paymentStatus,
          transactionId: data.transactionId || `DH${Date.now()}${orderId}`,
          note: data.note || "",
        },
        { transaction: t }
      );
    } else {
      await payment.update(
        {
          amount: data.amount || payment.amount,
          method: data.method || payment.method,
          status: paymentStatus,
          transactionId: data.transactionId || payment.transactionId,
          note: data.note || payment.note,
        },
        { transaction: t }
      );
    }

    const orderStatusMap = {
      completed: "paid",
      refunded: "refunded",
      pending: "unpaid",
    };
    await order.update(
      {
        paymentStatus: orderStatusMap[paymentStatus] || "unpaid",
      },
      { transaction: t }
    );

    await t.commit();

    const updatedOrder = await db.Order.findByPk(orderId, {
      include: [{ model: db.Payment, as: "payment" }],
    });

    return {
      errCode: 0,
      errMessage: "Payment updated successfully",
      data: updatedOrder.toJSON(),
    };
  } catch (e) {
    if (t && !t.finished) {
      try {
        await t.rollback();
      } catch (rollbackErr) {
        console.error("Rollback failed in updatePayment:", rollbackErr);
      }
    }
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

    try {
      await deleteCacheByPattern("dashboard_*");
    } catch (cacheErr) {
      console.warn("Failed to invalidate dashboard cache:", cacheErr?.message);
    }

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

    if (!t_external) {
      await t.commit();
      try {
        await deleteCacheByPattern("dashboard_*");
      } catch (cacheErr) {
        console.warn("Failed to invalidate dashboard cache:", cacheErr?.message);
      }
    }
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

    const rows = await db.Payment.findAll({
      where,
      attributes: [
        "status",
        "method",
        [db.Sequelize.fn("SUM", db.Sequelize.col("amount")), "totalAmount"],
        [db.Sequelize.fn("COUNT", db.Sequelize.col("id")), "txCount"],
      ],
      group: ["status", "method"],
      raw: true,
    });

    let totalRevenue = 0;
    let pendingAmount = 0;
    let refundedAmount = 0;
    let onlineCount = 0;
    let codCount = 0;
    let totalTransactions = 0;

    rows.forEach((row) => {
      const amount = Number(row.totalAmount) || 0;
      const count = Number(row.txCount) || 0;
      totalTransactions += count;

      if (row.status === "completed") totalRevenue += amount;
      else if (row.status === "pending") pendingAmount += amount;
      else if (row.status === "refunded") refundedAmount += amount;

      if (row.method === "cod") codCount += count;
      else onlineCount += count;
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
        totalTransactions,
      },
    };
  } catch (e) {
    console.error("Error getPaymentSummary:", e);
    return { errCode: 1, errMessage: "Internal server error" };
  }
};

const createPaypalCheckoutOrder = async (orderPayload = {}, user = null) => {
  if (!user?.id) {
    return { errCode: 401, statusCode: 401, errMessage: "Vui lòng đăng nhập để thanh toán." };
  }

  if (!PaypalService.isPaypalConfigured()) {
    return {
      errCode: 503,
      statusCode: 503,
      errMessage: "Thanh toán PayPal chưa được cấu hình đầy đủ trên máy chủ.",
    };
  }

  const OrderCreationUseCase = require("./use-cases/OrderCreationUseCase");
  const OrderStatusUseCase = require("./use-cases/OrderStatusUseCase");

  const sanitizedOrderPayload = { ...orderPayload };
  delete sanitizedOrderPayload.paymentStatus;
  delete sanitizedOrderPayload.paypalDetails;

  const orderRes = await OrderCreationUseCase.createOrder(
    {
      ...sanitizedOrderPayload,
      userId: user.id,
      paymentMethod: "paypal",
    },
    user
  );

  if (!orderRes || orderRes.errCode !== 0 || !orderRes.data) {
    return orderRes || { errCode: 1, statusCode: 400, errMessage: "Không thể tạo đơn hàng." };
  }

  const order = orderRes.data;

  if (Number(order.totalPrice) <= 0) {
    await OrderStatusUseCase.updateOrderStatus(
      order.id,
      "cancelled",
      { id: user.id, role: "admin" },
      "Đơn hàng 0đ không hỗ trợ PayPal"
    );
    return {
      errCode: 1,
      statusCode: 400,
      errMessage: "Đơn hàng 0đ không cần thanh toán qua PayPal, vui lòng chọn COD.",
    };
  }

  const ppRes = await PaypalService.createPaypalOrder({
    orderCode: order.orderCode,
    totalPriceVnd: order.totalPrice,
  });

  if (!ppRes || ppRes.errCode !== 0 || !ppRes.data?.paypalOrderId) {
    await OrderStatusUseCase.updateOrderStatus(
      order.id,
      "cancelled",
      { id: user.id, role: "admin" },
      "Khởi tạo thanh toán PayPal thất bại"
    );
    return {
      errCode: ppRes?.errCode || 502,
      statusCode: ppRes?.errCode === 503 ? 503 : 502,
      errMessage: ppRes?.errMessage || "Không thể khởi tạo giao dịch PayPal.",
    };
  }

  await db.Payment.create({
    orderId: order.id,
    userId: order.userId,
    amount: order.totalPrice,
    method: "paypal",
    transactionId: ppRes.data.paypalOrderId,
    status: "pending",
    note: JSON.stringify({
      expectedUsd: ppRes.data.usdAmount,
      currency: ppRes.data.currency,
    }),
  });

  return {
    errCode: 0,
    errMessage: "Khởi tạo thanh toán PayPal thành công",
    data: {
      order,
      paypalOrderId: ppRes.data.paypalOrderId,
      usdAmount: ppRes.data.usdAmount,
      currency: ppRes.data.currency,
    },
  };
};

const capturePaypalCheckoutOrder = async ({ orderId, paypalOrderId }, user = null) => {
  if (!user?.id) {
    return { errCode: 401, statusCode: 401, errMessage: "Vui lòng đăng nhập để thanh toán." };
  }

  if (!PaypalService.isPaypalConfigured()) {
    return {
      errCode: 503,
      statusCode: 503,
      errMessage: "Thanh toán PayPal chưa được cấu hình đầy đủ trên máy chủ.",
    };
  }

  const order = await db.Order.findByPk(orderId);
  if (!order) {
    return { errCode: 3, statusCode: 404, errMessage: "Không tìm thấy đơn hàng." };
  }

  const isElevated = ["admin", "root"].includes(user.role);
  if (!isElevated && String(order.userId) !== String(user.id)) {
    return {
      errCode: 403,
      statusCode: 403,
      errMessage: "Bạn không có quyền xác nhận thanh toán đơn hàng này.",
    };
  }

  if (String(order.paymentMethod || "").toLowerCase() !== "paypal") {
    return {
      errCode: 4,
      statusCode: 400,
      errMessage: "Đơn hàng này không sử dụng phương thức PayPal.",
    };
  }

  if (order.status === "cancelled") {
    return {
      errCode: 5,
      statusCode: 400,
      errMessage: "Đơn hàng đã bị hủy, không thể xác nhận thanh toán.",
    };
  }

  if (order.paymentStatus === "paid") {
    return {
      errCode: 0,
      errMessage: "Đơn hàng đã được thanh toán",
      alreadyPaid: true,
      data: order,
    };
  }

  const pendingPayment = await db.Payment.findOne({ where: { orderId: order.id } });
  if (
    !pendingPayment ||
    String(pendingPayment.method || "").toLowerCase() !== "paypal" ||
    pendingPayment.transactionId !== paypalOrderId
  ) {
    return {
      errCode: 4,
      statusCode: 400,
      errMessage: "Mã giao dịch PayPal không khớp với đơn hàng.",
    };
  }

  let expectedUsd = null;
  try {
    const meta = JSON.parse(pendingPayment.note || "{}");
    if (meta.expectedUsd) expectedUsd = Number(meta.expectedUsd);
  } catch {
    expectedUsd = null;
  }
  if (!expectedUsd || !Number.isFinite(expectedUsd)) {
    expectedUsd = Number(await PaypalService.convertVndToUsd(order.totalPrice));
  }

  const captureRes = await PaypalService.capturePaypalOrder(paypalOrderId);
  if (!captureRes || captureRes.errCode !== 0 || !captureRes.data) {
    return {
      errCode: captureRes?.errCode || 502,
      statusCode: captureRes?.errCode === 503 ? 503 : 400,
      errMessage: captureRes?.errMessage || "Xác thực thanh toán PayPal thất bại.",
    };
  }

  const capturedCurrency = String(captureRes.data.currency || "").toUpperCase();
  const capturedUsd = Number(captureRes.data.amountUsd);
  if (
    capturedCurrency !== "USD" ||
    !Number.isFinite(capturedUsd) ||
    Math.abs(capturedUsd - expectedUsd) > 0.01
  ) {
    return {
      errCode: 4,
      statusCode: 400,
      errMessage: "Số tiền thanh toán PayPal không khớp với giá trị đơn hàng.",
    };
  }

  if (captureRes.data.customId && String(captureRes.data.customId) !== String(order.orderCode)) {
    return {
      errCode: 4,
      statusCode: 400,
      errMessage: "Mã tham chiếu đơn hàng PayPal không khớp.",
    };
  }

  const confirmRes = await confirmPaymentFromWebhook({
    orderId: order.id,
    transactionId: captureRes.data.captureId || paypalOrderId,
    method: "paypal",
    note: `PayPal Capture ${captureRes.data.captureId} (${captureRes.data.amountUsd} USD)`,
    amount: order.totalPrice,
  });

  if (!confirmRes || confirmRes.errCode !== 0) {
    return confirmRes;
  }

  const updatedOrder = await db.Order.findByPk(order.id, {
    include: [{ model: db.OrderItem, as: "orderItems" }],
  });

  return {
    errCode: 0,
    errMessage: "Thanh toán PayPal thành công!",
    data: updatedOrder || order,
  };
};

module.exports = {
  executeRefund,
  getAllPayments,
  getPaymentById,
  createPayment,
  confirmPaymentFromWebhook,
  createPaypalCheckoutOrder,
  capturePaypalCheckoutOrder,
  updatePayment,
  deletePayment,
  completePayment,
  refundPayment,
  getPaymentSummary,
};
