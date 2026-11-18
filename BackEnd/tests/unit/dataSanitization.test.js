const { sanitizeOutputData, handleResponse, handleError } = require("../../src/utils/controllerHelper");

describe("Data Sanitization & Leakage Prevention Unit Tests", () => {
  test("Loại bỏ trường nhạy cảm password, refreshTokenHash, resetToken, verificationToken khỏi dữ liệu trả về", () => {
    const rawUserData = {
      id: 1,
      username: "admin_user",
      email: "admin@tientech.com",
      password: "$2b$10$hashedpasswordhere",
      refreshTokenHash: "hash12345",
      resetToken: "secret_reset_token",
      verificationToken: "verify_token",
      role: "admin",
      profile: {
        bio: "Hardware Architect",
        password: "nested_leak_password",
      },
      _previousDataValues: { id: 1 },
      isNewRecord: false,
    };

    const sanitized = sanitizeOutputData(rawUserData);

    expect(sanitized.id).toBe(1);
    expect(sanitized.username).toBe("admin_user");
    expect(sanitized.email).toBe("admin@tientech.com");
    expect(sanitized.role).toBe("admin");
    expect(sanitized.profile.bio).toBe("Hardware Architect");

    // Must be completely deleted
    expect(sanitized.password).toBeUndefined();
    expect(sanitized.refreshTokenHash).toBeUndefined();
    expect(sanitized.resetToken).toBeUndefined();
    expect(sanitized.verificationToken).toBeUndefined();
    expect(sanitized.profile.password).toBeUndefined();
    expect(sanitized._previousDataValues).toBeUndefined();
    expect(sanitized.isNewRecord).toBeUndefined();
  });

  test("Lọc mảng dữ liệu có chứa Sequelize model instance giả lập toJSON()", () => {
    const mockModelInstance = {
      id: 2,
      name: "Customer John",
      toJSON: () => ({
        id: 2,
        name: "Customer John",
        password: "secret_hash",
        refreshTokenHash: "token_hash",
      }),
    };

    const sanitizedArray = sanitizeOutputData([mockModelInstance, { id: 3, password: "hash3", name: "User 3" }]);

    expect(sanitizedArray).toHaveLength(2);
    expect(sanitizedArray[0].name).toBe("Customer John");
    expect(sanitizedArray[0].password).toBeUndefined();
    expect(sanitizedArray[0].refreshTokenHash).toBeUndefined();

    expect(sanitizedArray[1].name).toBe("User 3");
    expect(sanitizedArray[1].password).toBeUndefined();
  });

  test("handleResponse tự động lọc dữ liệu nhạy cảm trong response payload", () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const result = {
      errCode: 0,
      errMessage: "OK",
      data: {
        id: 99,
        email: "test@domain.com",
        password: "should_not_be_present",
        refreshTokenHash: "should_not_be_present",
      },
    };

    handleResponse(mockRes, result);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    const sentJson = mockRes.json.mock.calls[0][0];
    expect(sentJson.data.id).toBe(99);
    expect(sentJson.data.email).toBe("test@domain.com");
    expect(sentJson.data.password).toBeUndefined();
    expect(sentJson.data.refreshTokenHash).toBeUndefined();
  });

  test("Loại bỏ tokenVersion, *ExpiresAt và embedding khỏi data và products; handleError gắn requestId", () => {
    const mockRes = {
      req: { requestId: "req-trace-123" },
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    handleResponse(mockRes, {
      errCode: 0,
      data: {
        id: 1,
        tokenVersion: 3,
        resetTokenExpiresAt: new Date(),
        verificationTokenExpiresAt: new Date(),
        refreshTokenExpiresAt: new Date(),
      },
      products: [{ id: 10, name: "Phone", embedding: "[0.1,0.2,0.3]" }],
    });

    const sentJson = mockRes.json.mock.calls[0][0];
    expect(sentJson.data.tokenVersion).toBeUndefined();
    expect(sentJson.data.resetTokenExpiresAt).toBeUndefined();
    expect(sentJson.data.verificationTokenExpiresAt).toBeUndefined();
    expect(sentJson.data.refreshTokenExpiresAt).toBeUndefined();
    expect(sentJson.products[0].embedding).toBeUndefined();

    const errRes = {
      req: { requestId: "req-err-456" },
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.spyOn(console, "error").mockImplementation(() => {});
    handleError(errRes, new Error("DB timeout"), "testMethod");
    expect(errRes.status).toHaveBeenCalledWith(500);
    expect(errRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: "req-err-456", errCode: -1 })
    );
  });
});

