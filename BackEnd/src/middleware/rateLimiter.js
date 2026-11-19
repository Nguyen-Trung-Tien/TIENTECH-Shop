const rateLimit = require("express-rate-limit");
const redis = require("../config/redis");

const isProduction = process.env.NODE_ENV === "production";
const MAX_FALLBACK_KEYS = 5000;

class ResilientRedisStore {
  constructor(prefix = "rl:") {
    this.prefix = prefix;
    this.windowMs = 15 * 60 * 1000;
    this.memoryHits = new Map();
    this.localKeys = false;
  }

  init(options) {
    if (options && typeof options.windowMs === "number") {
      this.windowMs = options.windowMs;
    }
  }

  _evictMemoryIfNeeded(now) {
    if (this.memoryHits.size < MAX_FALLBACK_KEYS) return;
    for (const [k, entry] of this.memoryHits.entries()) {
      if (!entry || now >= entry.resetAt) {
        this.memoryHits.delete(k);
      }
    }
    while (this.memoryHits.size >= MAX_FALLBACK_KEYS) {
      const oldest = this.memoryHits.keys().next().value;
      if (oldest === undefined) break;
      this.memoryHits.delete(oldest);
    }
  }

  _memoryIncrement(fullKey) {
    const now = Date.now();
    this._evictMemoryIfNeeded(now);

    const existing = this.memoryHits.get(fullKey);
    if (!existing || now >= existing.resetAt) {
      const resetAt = now + this.windowMs;
      this.memoryHits.set(fullKey, { totalHits: 1, resetAt });
      return { totalHits: 1, resetTime: new Date(resetAt) };
    }

    existing.totalHits += 1;
    return { totalHits: existing.totalHits, resetTime: new Date(existing.resetAt) };
  }

  async increment(key) {
    const fullKey = `${this.prefix}${key}`;
    if (process.env.NODE_ENV !== "test" && redis.isRedisConnected() && redis.redisClient) {
      try {
        const totalHits = await redis.redisClient.incr(fullKey);
        let pttl = await redis.redisClient.pTTL(fullKey);
        if (totalHits === 1 || pttl < 0) {
          await redis.redisClient.pExpire(fullKey, this.windowMs);
          pttl = this.windowMs;
        }
        return {
          totalHits,
          resetTime: new Date(Date.now() + pttl),
        };
      } catch (err) {
        console.warn(`[RateLimiter] Redis fallback for ${fullKey}:`, err?.message);
      }
    }
    return this._memoryIncrement(fullKey);
  }

  async decrement(key) {
    const fullKey = `${this.prefix}${key}`;
    if (process.env.NODE_ENV !== "test" && redis.isRedisConnected() && redis.redisClient) {
      try {
        const nextVal = await redis.redisClient.decr(fullKey);
        if (nextVal < 0) {
          await redis.redisClient.del(fullKey);
        }
        return;
      } catch (_err) {
        // Fallback silently
      }
    }
    const existing = this.memoryHits.get(fullKey);
    if (existing && existing.totalHits > 0) {
      existing.totalHits -= 1;
    }
  }

  async resetKey(key) {
    const fullKey = `${this.prefix}${key}`;
    this.memoryHits.delete(fullKey);
    if (process.env.NODE_ENV !== "test" && redis.isRedisConnected() && redis.redisClient) {
      try {
        await redis.redisClient.del(fullKey);
      } catch (_err) {
        // Ignore
      }
    }
  }

  async get(key) {
    const fullKey = `${this.prefix}${key}`;
    if (process.env.NODE_ENV !== "test" && redis.isRedisConnected() && redis.redisClient) {
      try {
        const [val, pttl] = await Promise.all([
          redis.redisClient.get(fullKey),
          redis.redisClient.pTTL(fullKey),
        ]);
        if (val === null) return undefined;
        return {
          totalHits: Number(val) || 0,
          resetTime: pttl > 0 ? new Date(Date.now() + pttl) : new Date(Date.now() + this.windowMs),
        };
      } catch (_err) {
        // Fallback to memory
      }
    }
    const entry = this.memoryHits.get(fullKey);
    if (!entry || Date.now() >= entry.resetAt) return undefined;
    return { totalHits: entry.totalHits, resetTime: new Date(entry.resetAt) };
  }
}

const buildRateLimitMessage = (errMessage) => ({
  status: "TOO_MANY_REQUESTS",
  statusCode: 429,
  errCode: 429,
  code: "RATE_LIMIT_EXCEEDED",
  errMessage,
  message: errMessage,
});

// 1. General API Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 1000 : 20000,
  standardHeaders: true,
  legacyHeaders: false,
  store: new ResilientRedisStore("rl:general:"),
  message: {
    errCode: 429,
    errMessage: "Quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau 15 phút.",
  },
});

// 2. Strict Login / Auth Rate Limiter
const loginAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: new ResilientRedisStore("rl:login:"),
  message: {
    errCode: 429,
    errMessage: "Bạn đã thử đăng nhập quá nhiều lần sai. Vui lòng thử lại sau 15 phút để bảo vệ tài khoản.",
  },
});

// 3. Sensitive Action Limiter (Reset password / Register / Contact)
const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new ResilientRedisStore("rl:sensitive:"),
  message: {
    errCode: 429,
    errMessage: "Thao tác gửi yêu cầu quá nhanh. Vui lòng thử lại sau 15 phút.",
  },
});

// 4. AI Endpoint Limiter
const aiApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  store: new ResilientRedisStore("rl:ai:"),
  message: {
    errCode: 429,
    errMessage: "Bạn đã gửi quá nhiều yêu cầu tư vấn AI. Vui lòng thử lại sau 15 phút.",
  },
});

// 5. OTP Verification Limiter
const otpVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new ResilientRedisStore("rl:otp:"),
  message: {
    errCode: 429,
    errMessage: "Bạn đã thử nhập mã xác thực quá 5 lần. Vui lòng thử lại sau 15 phút.",
  },
});

// 6. Refresh Token Limiter
const refreshTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 30 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: new ResilientRedisStore("rl:refresh:"),
  message: {
    errCode: 429,
    errMessage: "Quá nhiều yêu cầu làm mới phiên đăng nhập. Vui lòng thử lại sau ít phút.",
  },
});

// 7. Order Action Limiter
const orderActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 15 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: new ResilientRedisStore("rl:order:"),
  message: buildRateLimitMessage(
    "Bạn thao tác đơn hàng quá nhanh. Vui lòng thử lại sau ít phút."
  ),
});

// 8. Payment Action Limiter
const paymentActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 15 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: new ResilientRedisStore("rl:payment:"),
  message: buildRateLimitMessage(
    "Bạn đã gửi quá nhiều yêu cầu thanh toán. Vui lòng thử lại sau ít phút."
  ),
});

// 9. Voucher Check Limiter
const voucherCheckLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 20 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: new ResilientRedisStore("rl:voucher:"),
  message: buildRateLimitMessage(
    "Bạn đã kiểm tra mã giảm giá quá nhiều lần. Vui lòng thử lại sau 15 phút."
  ),
});

// 10. Review Mutation Limiter
const reviewMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 20 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: new ResilientRedisStore("rl:review:"),
  message: buildRateLimitMessage(
    "Bạn đã gửi quá nhiều thao tác đánh giá. Vui lòng thử lại sau ít phút."
  ),
});

// 11. Admin Mutation Limiter
const adminMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 40 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  store: new ResilientRedisStore("rl:admin:"),
  message: buildRateLimitMessage(
    "Quá nhiều thao tác cấu hình hệ thống liên tiếp. Vui lòng thử lại sau ít phút."
  ),
});

module.exports = {
  ResilientRedisStore,
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
