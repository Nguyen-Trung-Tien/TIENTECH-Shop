const redis = require("redis");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

let isRedisConnected = false;

redisClient.on("error", (err) => {
  if (isRedisConnected) {
    console.warn("[Redis] Connection lost:", err.message);
  }
  isRedisConnected = false;
});

redisClient.on("connect", () => {
  console.log("[Redis] Connecting...");
});

redisClient.on("ready", () => {
  console.log("[Redis] Connected and Ready");
  isRedisConnected = true;
});

(async () => {
  if (process.env.NODE_ENV !== "test") {
    try {
      await redisClient.connect();
    } catch (err) {
      console.warn("[Redis] Not available. System will run without cache.");
      isRedisConnected = false;
    }
  }
})();

const getCache = async (key) => {
  if (!isRedisConnected) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`[Redis] getCache error for key ${key}:`, err);
    return null;
  }
};

const setCache = async (key, value, ttl = 3600) => {
  if (!isRedisConnected) return;
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttl,
    });
  } catch (err) {
    console.error(`[Redis] setCache error for key ${key}:`, err);
  }
};

const deleteCache = async (key) => {
  if (!isRedisConnected) return;
  try {
    await redisClient.del(key);
  } catch (err) {
    console.error(`[Redis] deleteCache error for key ${key}:`, err);
  }
};

const deleteCacheByPattern = async (pattern) => {
  if (!isRedisConnected) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    console.error(`[Redis] deleteCacheByPattern error for pattern ${pattern}:`, err);
  }
};

module.exports = {
  redisClient,
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
  isRedisConnected: () => isRedisConnected,
};
