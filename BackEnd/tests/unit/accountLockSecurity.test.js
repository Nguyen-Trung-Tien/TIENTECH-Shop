const { authenticateToken } = require("../../src/middleware/authMiddleware");
const { getUserStatusKey } = require("../../src/services/user/AuthHelper");
const { generateAccessToken } = require("../../src/utils/jwtHelper");
const redis = require("../../src/config/redis");
const db = require("../../src/models");

jest.mock("../../src/config/redis", () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  deleteCache: jest.fn(),
}));

describe("Account Lock & Security Middleware Unit Tests", () => {
  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = "test_access_secret_123";
    process.env.JWT_SECRET = "test_access_secret_123";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getUserStatusKey returns correct cache key format", () => {
    expect(getUserStatusKey(99)).toBe("user:status:99");
    expect(getUserStatusKey("123")).toBe("user:status:123");
  });

  test("authenticateToken should BLOCK user when cached status is inactive (isActive: false)", async () => {
    const payload = { id: 101, email: "blocked@example.com", role: "customer" };
    const token = generateAccessToken(payload);

    // Mock Redis
    redis.getCache.mockImplementation(async (key) => {
      if (key.includes("blacklist")) return false;
      if (key === "user:status:101") return { isActive: false, role: "customer" };
      return null;
    });

    const req = {
      headers: { authorization: `Bearer ${token}` },
      cookies: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errCode: 3,
        code: "ACCOUNT_LOCKED",
        errMessage: expect.stringContaining("bị khóa"),
      })
    );
  });

  test("authenticateToken should ALLOW active user when cached status is active", async () => {
    const payload = { id: 102, email: "active@example.com", role: "customer" };
    const token = generateAccessToken(payload);

    redis.getCache.mockImplementation(async (key) => {
      if (key.includes("blacklist")) return false;
      if (key === "user:status:102") return { isActive: true, role: "customer" };
      return null;
    });

    const req = {
      headers: { authorization: `Bearer ${token}` },
      cookies: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(102);
  });

  test("authenticateToken should query DB and cache status on cache miss", async () => {
    const payload = { id: 103, email: "cachemiss@example.com", role: "customer" };
    const token = generateAccessToken(payload);

    redis.getCache.mockResolvedValue(null);

    const mockFindByPk = jest.spyOn(db.User, "findByPk").mockResolvedValue({
      id: 103,
      isActive: true,
      role: "customer",
    });

    const req = {
      headers: { authorization: `Bearer ${token}` },
      cookies: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await authenticateToken(req, res, next);

    expect(mockFindByPk).toHaveBeenCalledWith(103, expect.any(Object));
    expect(redis.setCache).toHaveBeenCalledWith(
      "user:status:103",
      { isActive: true, role: "customer" },
      300
    );
    expect(next).toHaveBeenCalled();

    mockFindByPk.mockRestore();
  });
});

