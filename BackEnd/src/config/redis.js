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
    const keysToDelete = [];
    for await (const key of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      keysToDelete.push(key);
    }
    if (keysToDelete.length > 0) {
      await redisClient.del(keysToDelete);
    }
  } catch (err) {
    console.error(`[Redis] deleteCacheByPattern error for pattern ${pattern}:`, err);
  }
};

const flushAllCache = async () => {
  if (!isRedisConnected || !redisClient) {
    return {
      success: true,
      redisConnected: false,
      message: "Redis hiện không kết nối hoặc đang ở chế độ Direct DB. Không có cache tồn đọng.",
    };
  }
  try {
    if (typeof redisClient.flushDb === "function") {
      await redisClient.flushDb();
    } else if (typeof redisClient.flushdb === "function") {
      await redisClient.flushdb();
    } else if (typeof redisClient.flushAll === "function") {
      await redisClient.flushAll();
    }
    return {
      success: true,
      redisConnected: true,
      message: "Toàn bộ Redis Cache đã được dọn sạch thành công!",
    };
  } catch (err) {
    console.error(`[Redis] flushAllCache error:`, err);
    return {
      success: false,
      redisConnected: isRedisConnected,
      message: err.message || "Lỗi xóa cache Redis.",
    };
  }
};

const getRedisStats = async () => {
  if (!isRedisConnected) {
    return { connected: false, uptime: 0, usedMemory: "0 MB", totalKeys: 0 };
  }
  try {
    const info = await redisClient.info();
    const dbSize = await redisClient.dbSize();
    // Parse memory from info string
    const match = info.match(/used_memory_human:([^\r\n]+)/);
    const usedMemory = match ? match[1] : "N/A";
    return {
      connected: true,
      totalKeys: dbSize || 0,
      usedMemory,
    };
  } catch (err) {
    return { connected: false, error: err.message };
  }
};

const acquireLock = async (key, ttl = 10) => {
  if (!isRedisConnected) return true;
  try {
    const result = await redisClient.set(`lock:${key}`, "locked", {
      NX: true,
      EX: ttl,
    });
    return result === "OK";
  } catch (err) {
    console.error(`[Redis] acquireLock error for key ${key}:`, err);
    return true;
  }
};

const releaseLock = async (key) => {
  if (!isRedisConnected) return;
  try {
    await redisClient.del(`lock:${key}`);
  } catch (err) {
    console.error(`[Redis] releaseLock error for key ${key}:`, err);
  }
};

module.exports = {
  redisClient,
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
  flushAllCache,
  getRedisStats,
  acquireLock,
  releaseLock,
  isRedisConnected: () => isRedisConnected,
};
