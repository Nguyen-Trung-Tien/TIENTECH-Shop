const jwt = require("jsonwebtoken");
const AuthService = require("../../src/services/user/AuthService");
const { authenticateToken } = require("../../src/middleware/authMiddleware");
const { generateRandomToken, getLoginFailKey } = require("../../src/services/user/AuthHelper");
const { generateAccessToken, generateRefreshToken, verifyAccessTokenDetailed } = require("../../src/utils/jwtHelper");
const redis = require("../../src/config/redis");
const db = require("../../src/models");

jest.mock("../../src/config/redis", () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  deleteCache: jest.fn(),
}));

describe("Auth & Security Hardening Unit Tests", () => {
  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = "test_access_secret_hardening";
    process.env.JWT_REFRESH_SECRET = "test_refresh_secret_hardening";
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("generateRandomToken produces 6-digit numeric OTP strings", () => {
    for (let i = 0; i < 20; i++) {
      const otp = generateRandomToken();
      expect(otp).toMatch(/^\d{6}$/);
    }
  });

  test("JWT tokens include iss, aud, jti and reject mismatched issuer", () => {
    const token = generateAccessToken({ id: 1, email: "a@b.com", role: "customer", ver: 0 });
    const decoded = jwt.decode(token);
    expect(decoded.iss).toBe("tientech-shop-api");
    expect(decoded.aud).toBe("tientech-shop-client");
    expect(decoded.jti).toBeDefined();

    const forged = jwt.sign({ id: 1 }, process.env.JWT_ACCESS_SECRET, {
      algorithm: "HS256",
      issuer: "evil-issuer",
      audience: "tientech-shop-client",
    });
    expect(verifyAccessTokenDetailed(forged).valid).toBe(false);
  });

  test("forgotPassword and resendVerificationEmail prevent user enumeration", async () => {
    jest.spyOn(db.User, "findOne").mockResolvedValue(null);

    const forgotRes = await AuthService.forgotPassword("nonexistent@example.com");
    expect(forgotRes.errCode).toBe(0);

    const resendRes = await AuthService.resendVerificationEmail("nonexistent@example.com");
    expect(resendRes.errCode).toBe(0);
  });

  test("login blocks temporarily locked email and handles Google-only user with null password", async () => {
    redis.getCache.mockResolvedValueOnce({ count: 5, lockedUntil: Date.now() + 60000 });
    const lockedRes = await AuthService.login("locked@example.com", "AnyPass1!");
    expect(lockedRes.statusCode).toBe(429);

    redis.getCache.mockResolvedValueOnce(null);
    jest.spyOn(db.User, "findOne").mockResolvedValue({
      id: 50,
      email: "googleonly@example.com",
      password: null,
      isActive: true,
    });
    const googleRes = await AuthService.login("googleonly@example.com", "AnyPass1!");
    expect(googleRes.statusCode).toBe(401);
    expect(redis.setCache).toHaveBeenCalledWith(
      getLoginFailKey("googleonly@example.com"),
      expect.objectContaining({ count: 1 }),
      900
    );
  });

  test("refreshToken revokes session on reuse detection (hash mismatch)", async () => {
    const token = generateRefreshToken({ id: 77, email: "u@e.com", role: "customer", ver: 0 });
    redis.getCache.mockResolvedValue({
      hash: "different_hash_from_newer_rotation",
      expiresAt: new Date(Date.now() + 60000).toISOString(),
      email: "u@e.com",
      role: "customer",
      ver: 0,
    });
    const updateSpy = jest.spyOn(db.User, "update").mockResolvedValue([1]);

    const res = await AuthService.refreshToken(token);
    expect(res.statusCode).toBe(401);
    expect(redis.deleteCache).toHaveBeenCalledWith("user:refreshtoken:77");
    expect(updateSpy).toHaveBeenCalledWith(
      { refreshTokenHash: null, refreshTokenExpiresAt: null },
      { where: { id: 77 } }
    );
  });

  test("authenticateToken rejects stale tokenVersion after password change", async () => {
    const token = generateAccessToken({ id: 88, email: "v@e.com", role: "customer", ver: 1 });
    redis.getCache.mockImplementation(async (key) => {
      if (key.includes("blacklist")) return null;
      if (key === "user:status:88") return { isActive: true, role: "customer", tokenVersion: 2 };
      return null;
    });

    const req = { headers: { authorization: `Bearer ${token}` }, cookies: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    await authenticateToken(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: "TOKEN_REVOKED" }));
  });
});
