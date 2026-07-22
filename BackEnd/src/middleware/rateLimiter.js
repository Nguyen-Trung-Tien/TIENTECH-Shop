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

module.exports = {
  generalLimiter,
  loginAuthLimiter,
  sensitiveActionLimiter,
};
