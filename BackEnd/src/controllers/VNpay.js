const { formatDateYYYYMMDDHHmmss } = require("../utils/dateFormatter");
const crypto = require("crypto");
const OrderService = require("../services/order/OrderService");
const { getFrontendUrl } = require("../config/corsConfig");

const sendVnpayJson = (res, statusCode, errCode, errMessage, data = null) =>
  res.status(statusCode).json({
    status: statusCode >= 400 ? "ERROR" : "OK",
    statusCode,
    errCode,
    errMessage,
    message: errMessage,
    data,
  });

function sortObject(obj) {
  const sorted = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });
  return sorted;
}

const extractOrderCodeFromTxnRef = (txnRef) => {
  const raw = String(txnRef || "").trim();
  if (!raw) return "";
  const match = raw.match(/^(.+)_(\d{10,})$/);
  return match ? match[1] : raw;
};

function buildSignData(params) {
  return Object.keys(params)
    .sort()
    .map(
      (key) => `${key}=${encodeURIComponent(params[key]).replace(/%20/g, "+")}`,
    )
    .join("&");
}

function isValidSignature(secureHash, generatedHash) {
  if (typeof secureHash !== "string" || typeof generatedHash !== "string") {
    return false;
  }
  const a = Buffer.from(secureHash, "utf8");
  const b = Buffer.from(generatedHash, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

const handleCreateVnpayPayment = async (req, res) => {
  try {
    const { orderCode } = req.body;

    if (!orderCode) {
      return sendVnpayJson(res, 400, 1, "Thiếu mã đơn hàng (orderCode).");
    }

    // check order tồn tại
    const orderResult = await OrderService.getOrderByCode(orderCode);
    if (orderResult.errCode !== 0 || !orderResult.data) {
      return sendVnpayJson(res, 404, 2, "Không tìm thấy đơn hàng.");
    }

    const order = orderResult.data;

    // SECURITY: Verify order ownership
    const isElevated = req.user && ["admin", "root"].includes(req.user.role);
    if (
      req.user &&
      !isElevated &&
      String(order.userId) !== String(req.user.id)
    ) {
      return sendVnpayJson(res, 403, 403, "Bạn không có quyền thanh toán đơn hàng này.");
    }

    if (order.status === "cancelled") {
      return sendVnpayJson(res, 400, 5, "Đơn hàng đã bị hủy, không thể thanh toán.");
    }

    // Không cho phép thanh toán lại đơn đã trả tiền
    if (order.paymentStatus === "paid") {
      return sendVnpayJson(res, 400, 4, "Đơn hàng này đã được thanh toán.");
    }

    // SECURITY: Luôn lấy giá trị từ Database, tuyệt đối không fallback về amount từ client
    const secureAmount = Number(order.totalPrice);

    if (!Number.isFinite(secureAmount) || secureAmount <= 0) {
      return sendVnpayJson(res, 400, 3, "Số tiền thanh toán không hợp lệ.");
    }

    let ipAddr =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    if (ipAddr.includes(",")) ipAddr = ipAddr.split(",")[0];
    if (ipAddr === "::1") ipAddr = "127.0.0.1";

    const tmnCode = process.env.VNP_TMN_CODE;
    const secretKey = process.env.VNP_HASH_SECRET;
    const vnpUrl = process.env.VNP_URL;
    const returnUrl = process.env.VNP_RETURN_URL;

    const createDate = formatDateYYYYMMDDHHmmss();

    // VNPay yêu cầu INTEGER (nhân 100)
    // SỬ DỤNG GIÁ TRỊ TỪ DATABASE (secureAmount) THAY VÌ CLIENT SUBMIT (amount) ĐỂ TRÁNH MUA HÀNG 0 ĐỒNG
    const vnpAmount = Math.round(Number(secureAmount) * 100);

    const vnp_TxnRef = `${orderCode}_${Date.now()}`;

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef,
      vnp_OrderInfo: `Thanh toan don hang ${orderCode}`,
      vnp_OrderType: "billpayment",
      vnp_Amount: vnpAmount,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    // SIGN
    const sortedParams = sortObject(vnp_Params);
    const signData = buildSignData(sortedParams);

    const secureHash = crypto
      .createHmac("sha512", secretKey)
      .update(signData, "utf-8")
      .digest("hex");

    vnp_Params.vnp_SecureHashType = "SHA512";
    vnp_Params.vnp_SecureHash = secureHash;

    // TUYỆT ĐỐI KHÔNG dùng qs.stringify
    const paymentUrl = `${vnpUrl}?${buildSignData(vnp_Params)}`;

    return sendVnpayJson(res, 200, 0, "OK", {
      paymentUrl,
      orderCode,
    });
  } catch (err) {
    console.error("VNPay Create Error:", err);
    return sendVnpayJson(res, 500, -1, "Lỗi máy chủ nội bộ.");
  }
};

const handleVnpayReturn = async (req, res) => {
  try {
    let vnp_Params = { ...req.query };
    const secureHash = vnp_Params.vnp_SecureHash;

    if (!secureHash) {
      return sendVnpayJson(res, 400, 1, "Thiếu chữ ký xác thực (Missing secure hash).");
    }

    // XÓA HASH TRƯỚC KHI VERIFY
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    // SORT + BUILD SIGN DATA
    const sortedParams = sortObject(vnp_Params);
    const signData = buildSignData(sortedParams);

    const generatedHash = crypto
      .createHmac("sha512", process.env.VNP_HASH_SECRET)
      .update(signData, "utf-8")
      .digest("hex");

    // SAI CHỮ KÝ
    if (!isValidSignature(secureHash, generatedHash)) {
      return sendVnpayJson(res, 400, 2, "Chữ ký VNPay không hợp lệ.");
    }

    // LẤY THÔNG TIN (hỗ trợ cả orderCode gốc và orderCode_timestamp khi retry payment)
    const orderCode = extractOrderCodeFromTxnRef(vnp_Params.vnp_TxnRef);
    const rspCode = vnp_Params.vnp_ResponseCode;
    const vnpAmount = Number(vnp_Params.vnp_Amount);

    // TÌM ORDER THEO orderCode
    const orderResult = await OrderService.getOrderByCode(orderCode);
    if (orderResult.errCode !== 0 || !orderResult.data) {
      return sendVnpayJson(res, 404, 3, "Không tìm thấy đơn hàng.");
    }

    const order = orderResult.data;

    // Kiểm tra số tiền khớp với đơn hàng trong DB
    if (
      !Number.isFinite(vnpAmount) ||
      Math.round(Number(order.totalPrice) * 100) !== vnpAmount
    ) {
      return sendVnpayJson(res, 400, 4, "Số tiền thanh toán không khớp với đơn hàng.");
    }

    // THANH TOÁN THÀNH CÔNG
    const frontendUrl = getFrontendUrl();
    if (rspCode === "00") {
      const PaymentService = require("../services/order/PaymentService");
      const confirmRes = await PaymentService.confirmPaymentFromWebhook({
        orderId: order.id,
        transactionId: vnp_Params.vnp_TransactionNo,
        method: "vnpay",
        note: "VNPay Return Auto Confirm",
        amount: vnpAmount,
      });

      if (confirmRes?.errCode === 0) {
        return res.redirect(`${frontendUrl}/checkout-success/${orderCode}`);
      }
      return res.redirect(`${frontendUrl}/checkout-failed/${orderCode}`);
    }

    // THANH TOÁN THẤT BẠI (Không ghi đè nếu đơn hàng đã được xác nhận thanh toán qua IPN)
    if (order.paymentStatus !== "paid") {
      await OrderService.updatePaymentStatus(order.id, "unpaid");
    }

    return res.redirect(`${frontendUrl}/checkout-failed/${orderCode}`);
  } catch (err) {
    console.error("VNPay Return Error:", err);
    return sendVnpayJson(res, 500, -1, "Lỗi máy chủ nội bộ.");
  }
};

const handleVnpayIPN = async (req, res) => {
  try {
    let vnp_Params = { ...req.query };
    const secureHash = vnp_Params.vnp_SecureHash;

    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;

    const sortedParams = sortObject(vnp_Params);
    const signData = buildSignData(sortedParams);
    const secretKey = process.env.VNP_HASH_SECRET;

    const generatedHash = crypto
      .createHmac("sha512", secretKey)
      .update(signData, "utf-8")
      .digest("hex");

    if (!isValidSignature(secureHash, generatedHash)) {
      return res
        .status(200)
        .json({ RspCode: "97", Message: "Invalid checksum" });
    }

    const orderCode = extractOrderCodeFromTxnRef(vnp_Params.vnp_TxnRef);
    const rspCode = vnp_Params.vnp_ResponseCode;
    const vnp_Amount = vnp_Params.vnp_Amount; // VNPay amount là * 100

    const orderResult = await OrderService.getOrderByCode(orderCode);
    if (orderResult.errCode !== 0 || !orderResult.data) {
      return res
        .status(200)
        .json({ RspCode: "01", Message: "Order not found" });
    }

    const order = orderResult.data;

    // Kiểm tra số tiền (VNPay gửi amount * 100)
    if (Math.round(order.totalPrice * 100) !== Number(vnp_Amount)) {
      return res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
    }

    // Kiểm tra trạng thái đơn hàng (tránh update lại đơn đã xong)
    if (order.paymentStatus === "paid") {
      return res
        .status(200)
        .json({ RspCode: "02", Message: "Order already confirmed" });
    }

    if (rspCode === "00") {
      const PaymentService = require("../services/order/PaymentService");
      const confirmRes = await PaymentService.confirmPaymentFromWebhook({
        orderId: order.id,
        transactionId: vnp_Params.vnp_TransactionNo,
        method: "vnpay",
        note: "VNPay IPN Auto Confirm",
        amount: vnp_Amount,
      });

      if (confirmRes.errCode === 0) {
        return res
          .status(200)
          .json({ RspCode: "00", Message: "Confirm Success" });
      } else if (confirmRes.errCode === 4) {
        return res
          .status(200)
          .json({ RspCode: "04", Message: "Invalid amount" });
      } else {
        return res
          .status(200)
          .json({ RspCode: "02", Message: "Order already confirmed" });
      }
    } else {
      // Thất bại
      return res
        .status(200)
        .json({ RspCode: "00", Message: "Confirm Success (Payment Failed)" });
    }
  } catch (err) {
    console.error("VNPay IPN Error:", err);
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

module.exports = {
  handleCreateVnpayPayment,
  handleVnpayReturn,
  handleVnpayIPN,
  extractOrderCodeFromTxnRef,
};
