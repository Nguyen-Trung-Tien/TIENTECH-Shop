const rateLimit = require("express-rate-limit");
const isProduction = process.env.NODE_ENV === "production";

// General API Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: isProduction ? 1000 : 20000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    errCode: 429,
    errMessage: "Quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau 15 phút.",
  },
});

// Strict Login / Auth Rate Limiter
const loginAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // Tối đa 10 lần thử trong 15 phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    errCode: 429,
    errMessage: "Bạn đã thử đăng nhập quá nhiều lần sai. Vui lòng thử lại sau 15 phút để bảo vệ tài khoản.",
  },
});

// Sensitive Action Limiter (Reset password / Register)
const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    errCode: 429,
    errMessage: "Thao tác gửi yêu cầu quá nhanh. Vui lòng thử lại sau 15 phút.",
  },
});

// AI Endpoint Limiter to protect external Gemini API Quota
const aiApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    errCode: 429,
    errMessage: "Bạn đã gửi quá nhiều yêu cầu tư vấn AI. Vui lòng thử lại sau 15 phút.",
  },
});

// OTP Verification Limiter (Chống Brute-force mã 6 số)
const otpVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Tối đa 5 lần thử trong 15 phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    errCode: 429,
    errMessage: "Bạn đã thử nhập mã xác thực quá 5 lần. Vui lòng thử lại sau 15 phút.",
  },
});

// Refresh Token Limiter
const refreshTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: isProduction ? 30 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    errCode: 429,
    errMessage: "Quá nhiều yêu cầu làm mới phiên đăng nhập. Vui lòng thử lại sau ít phút.",
  },
});

const buildRateLimitMessage = (errMessage) => ({
  status: "TOO_MANY_REQUESTS",
  statusCode: 429,
  errCode: 429,
  code: "RATE_LIMIT_EXCEEDED",
  errMessage,
  message: errMessage,
});

// Order Action Limiter (Chống spam tạo đơn, trả hàng, đổi phương thức thanh toán)
const orderActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 15 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildRateLimitMessage(
    "Bạn thao tác đơn hàng quá nhanh. Vui lòng thử lại sau ít phút."
  ),
});

// Payment Action Limiter (Chống spam tạo giao dịch thanh toán / VNPay)
const paymentActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 15 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildRateLimitMessage(
    "Bạn đã gửi quá nhiều yêu cầu thanh toán. Vui lòng thử lại sau ít phút."
  ),
});

// Voucher Check Limiter (Chống brute-force/dò mã giảm giá)
const voucherCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 20 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildRateLimitMessage(
    "Bạn đã kiểm tra mã giảm giá quá nhiều lần. Vui lòng thử lại sau 15 phút."
  ),
});

// Review Mutation Limiter (Chống spam đánh giá sản phẩm)
const reviewMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 20 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildRateLimitMessage(
    "Bạn đã gửi quá nhiều thao tác đánh giá. Vui lòng thử lại sau ít phút."
  ),
});

// Admin Mutation Limiter (Bảo vệ thao tác cấu hình hệ thống)
const adminMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 40 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: buildRateLimitMessage(
    "Quá nhiều thao tác cấu hình hệ thống liên tiếp. Vui lòng thử lại sau ít phút."
  ),
});

module.exports = {
  generalLimiter,
  loginAuthLimiter,
  sensitiveActionLimiter,
  aiApiLimiter,
  otpVerificationLimiter,
  refreshTokenLimiter,
  orderActionLimiter,
  paymentActionLimiter,
  voucherCheckLimiter,
  reviewMutationLimiter,
  adminMutationLimiter,
};

