const AuthService = require("../../src/services/user/AuthService");

describe("AuthService.processGoogleAuth Unit Tests", () => {
  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = "test_access_secret";
    process.env.JWT_REFRESH_SECRET = "test_refresh_secret";
    process.env.JWT_ACCESS_EXPIRES = "15m";
    process.env.JWT_REFRESH_EXPIRES = "7d";
  });
  test("Should fail if user object is not provided", async () => {
    const result = await AuthService.processGoogleAuth(null, true);
    expect(result.errCode).toBe(1);
    expect(result.errorType).toBe("auth_failed");
  });

  test("Should fail if user account is locked / inactive", async () => {
    const mockUser = {
      id: 1,
      email: "banned@test.com",
      role: "admin",
      isActive: false,
    };
    const result = await AuthService.processGoogleAuth(mockUser, true);
    expect(result.errCode).toBe(2);
    expect(result.errorType).toBe("account_locked");
  });

  test("Should reject non-admin users attempting admin login", async () => {
    const mockUser = {
      id: 2,
      email: "customer@test.com",
      role: "customer",
      isActive: true,
    };
    const result = await AuthService.processGoogleAuth(mockUser, true);
    expect(result.errCode).toBe(3);
    expect(result.errorType).toBe("not_admin");
  });

  test("Should successfully authenticate admin user for admin portal", async () => {
    const mockUser = {
      id: 10,
      email: "admin@tientech.com",
      role: "admin",
      isActive: true,
      update: jest.fn().mockResolvedValue(true),
      toJSON: () => ({ id: 10, email: "admin@tientech.com", role: "admin" }),
    };

    const result = await AuthService.processGoogleAuth(mockUser, true);
    expect(result.errCode).toBe(0);
    expect(result.data).toBeDefined();
    expect(result.data.accessToken).toBeDefined();
    expect(result.data.refreshToken).toBeDefined();
    expect(result.data.user.role).toBe("admin");
    expect(mockUser.update).toHaveBeenCalled();
  });

  test("Should successfully authenticate customer user for regular login", async () => {
    const mockUser = {
      id: 20,
      email: "customer@gmail.com",
      role: "customer",
      isActive: true,
      update: jest.fn().mockResolvedValue(true),
      toJSON: () => ({ id: 20, email: "customer@gmail.com", role: "customer" }),
    };

    const result = await AuthService.processGoogleAuth(mockUser, false);
    expect(result.errCode).toBe(0);
    expect(result.data).toBeDefined();
    expect(result.data.accessToken).toBeDefined();
    expect(result.data.refreshToken).toBeDefined();
    expect(result.data.user.role).toBe("customer");
  });
});
