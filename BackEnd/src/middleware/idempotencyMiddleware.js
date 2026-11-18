const { getCache, setCache, deleteCache } = require("../config/redis");

// Fallback in-memory store when Redis is unavailable
const memoryStore = new Map();

const readIdempotencyRecord = async (cacheKey) => {
  const redisRecord = await getCache(cacheKey);
  if (redisRecord) return redisRecord;

  const mem = memoryStore.get(cacheKey);
  if (!mem) return null;
  if (Date.now() > mem.expiresAt) {
    memoryStore.delete(cacheKey);
    return null;
  }
  return mem.value;
};

const writeIdempotencyRecord = async (cacheKey, value, ttlSeconds) => {
  await setCache(cacheKey, value, ttlSeconds);
  memoryStore.set(cacheKey, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};

const clearIdempotencyRecord = async (cacheKey) => {
  await deleteCache(cacheKey);
  memoryStore.delete(cacheKey);
};

/**
 * Idempotency Guard Middleware:
 * Protects critical POST/PUT endpoints against duplicate submissions or network retries
 * when the client sends `X-Idempotency-Key`.
 */
const idempotencyGuard = ({ ttlSeconds = 300 } = {}) => {
  return async (req, res, next) => {
    const rawKey = req.headers["x-idempotency-key"];
    if (!rawKey || typeof rawKey !== "string" || !rawKey.trim()) {
      return next();
    }

    const idempotencyKey = rawKey.trim().slice(0, 128);
    const actorKey = req.user?.id ? `user:${req.user.id}` : `ip:${req.ip || "anon"}`;
    const cacheKey = `idem:${actorKey}:${req.method}:${req.baseUrl}${req.path}:${idempotencyKey}`;

    try {
      const existing = await readIdempotencyRecord(cacheKey);
      if (existing) {
        if (existing.state === "IN_PROGRESS") {
          return res.status(409).json({
            status: "CONFLICT",
            statusCode: 409,
            errCode: 409,
            code: "IDEMPOTENCY_IN_PROGRESS",
            errMessage: "Yêu cầu đang được xử lý, vui lòng không thao tác lặp lại.",
            message: "Duplicate request in progress",
          });
        }

        if (existing.state === "COMPLETED" && existing.body) {
          res.setHeader("X-Idempotency-Replayed", "true");
          return res.status(existing.statusCode || 200).json(existing.body);
        }
      }

      await writeIdempotencyRecord(cacheKey, { state: "IN_PROGRESS" }, 30);

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        const statusCode = res.statusCode || 200;
        if (statusCode >= 200 && statusCode < 300) {
          writeIdempotencyRecord(
            cacheKey,
            { state: "COMPLETED", statusCode, body },
            ttlSeconds
          ).catch(() => {});
        } else {
          // Allow retry if the request failed with 4xx/5xx
          clearIdempotencyRecord(cacheKey).catch(() => {});
        }
        return originalJson(body);
      };

      return next();
    } catch (err) {
      console.error("[IdempotencyGuard] Error:", err);
      return next();
    }
  };
};

module.exports = {
  idempotencyGuard,
};
