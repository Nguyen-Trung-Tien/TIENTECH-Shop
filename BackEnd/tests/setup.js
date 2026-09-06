// Jest global setup file
process.env.JWT_SECRET = "test_secret";
process.env.JWT_ACCESS_SECRET = "test_access_secret";
process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
process.env.NODE_ENV = "test";

// Mock ESM packages like uuid for Jest CommonJS environment
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-v4-1234-5678"),
}));

afterAll(async () => {
  try {
    const db = require("../src/models");
    if (db && db.sequelize && typeof db.sequelize.close === "function") {
      await db.sequelize.close();
    }
  } catch {}

  try {
    const { redisClient } = require("../src/config/redis");
    if (redisClient && typeof redisClient.quit === "function") {
      await redisClient.quit();
    }
  } catch {}
});
