process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test_access_secret";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test_refresh_secret";
process.env.JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";
process.env.JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";
process.env.NODE_ENV = "test";

// Mock ESM packages like uuid for Jest CommonJS environment
jest.mock("uuid", () => ({
  v4: jest.fn(() => "test-uuid-v4-1234-5678"),
}));

beforeAll(async () => {
  try {
    const db = require("../src/models");
    if (db && db.sequelize && typeof db.sequelize.sync === "function") {
      await db.sequelize.sync();
    }
  } catch (err) {
    console.warn("[Test Setup] DB sync warning:", err?.message);
  }
});

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
