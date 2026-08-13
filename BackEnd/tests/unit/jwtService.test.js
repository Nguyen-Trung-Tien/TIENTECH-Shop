const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessTokenDetailed,
  verifyRefreshTokenDetailed,
} = require("../../src/utils/jwtHelper");
const {
  hashToken,
  getUserProfileKey,
  getRefreshTokenKey,
  getTokenBlacklistKey,
  validatePasswordStrength,
} = require("../../src/services/user/AuthHelper");

describe("JWT & Auth Helper Unit Tests", () => {
  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = "test_access_secret";
    process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
    process.env.JWT_ACCESS_EXPIRES = "15m";
    process.env.JWT_REFRESH_EXPIRES = "7d";
  });

  test("Should generate and verify valid access token", () => {
    const payload = { id: 1, email: "test@example.com", role: "customer" };
    const token = generateAccessToken(payload);
    expect(token).toBeDefined();

    const result = verifyAccessTokenDetailed(token);
    expect(result.valid).toBe(true);
    expect(result.expired).toBe(false);
    expect(result.decoded.id).toBe(1);
    expect(result.decoded.email).toBe("test@example.com");
  });

  test("Should detect invalid access token signature", () => {
    const invalidToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.payload";
    const result = verifyAccessTokenDetailed(invalidToken);
    expect(result.valid).toBe(false);
    expect(result.expired).toBe(false);
  });

  test("Should generate and verify valid refresh token", () => {
    const payload = { id: 1, email: "test@example.com", role: "customer" };
    const token = generateRefreshToken(payload);
    expect(token).toBeDefined();

    const result = verifyRefreshTokenDetailed(token);
    expect(result.valid).toBe(true);
    expect(result.decoded.id).toBe(1);
  });

  test("Should generate correct Redis cache key names", () => {
    expect(getUserProfileKey(123)).toBe("user:profile:123");
    expect(getRefreshTokenKey(123)).toBe("user:refreshtoken:123");

    const sampleToken = "sample_token_string";
    const expectedHash = hashToken(sampleToken);
    expect(getTokenBlacklistKey(sampleToken)).toBe(`blacklist:token:${expectedHash}`);
  });

  test("Should validate password strength correctly", () => {
    expect(validatePasswordStrength("weak").valid).toBe(false);
    expect(validatePasswordStrength("NoSpecialChar123").valid).toBe(false);
    expect(validatePasswordStrength("NoNumberUpper!").valid).toBe(false);
    expect(validatePasswordStrength("ValidPassword123!").valid).toBe(true);
  });
});
