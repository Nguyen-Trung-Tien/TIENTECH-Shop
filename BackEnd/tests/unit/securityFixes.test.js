const request = require("supertest");
const app = require("../../src/app");
const { registerSchema } = require("../../src/utils/zodSchemas");
const {
  VALID_ADMIN_TRANSITIONS,
  validateAdminStatusTransition,
} = require("../../src/services/order/use-cases/OrderStatusUseCase");
const ProductController = require("../../src/controllers/ProductController");
const ProductService = require("../../src/services/product/ProductService");
const chatController = require("../../src/controllers/chatController");
const SystemSettingService = require("../../src/services/system/SystemSettingService");
const AdminAIService = require("../../src/services/ai/AdminAIService");
const geminiConfig = require("../../src/config/gemini");
const db = require("../../src/models");

describe("Security Hardening Verification", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("POST /api/v1/vnpay/create-vnpay-payment requires authentication", async () => {
    const res = await request(app)
      .post("/api/v1/vnpay/create-vnpay-payment")
      .send({ orderCode: "ORD123456" });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("NO_TOKEN");
  });

  it("registerSchema rejects missing or empty password instead of defaulting to 123456", () => {
    const missingPass = registerSchema.safeParse({
      body: { email: "user@example.com", username: "testuser" },
    });
    expect(missingPass.success).toBe(false);

    const emptyPass = registerSchema.safeParse({
      body: { email: "user@example.com", username: "testuser", password: "" },
    });
    expect(emptyPass.success).toBe(false);

    const validPass = registerSchema.safeParse({
      body: { email: "user@example.com", username: "testuser", password: "StrongPassword1" },
    });
    expect(validPass.success).toBe(true);
  });

  it("VALID_ADMIN_TRANSITIONS stays consistent with validateAdminStatusTransition for cancel_requested -> processing", () => {
    expect(VALID_ADMIN_TRANSITIONS.cancel_requested).toContain("processing");
    expect(validateAdminStatusTransition("cancel_requested", "processing").valid).toBe(true);
  });

  it("ProductController.handleFilterProducts ignores query isAdmin=true for non-admin callers", async () => {
    const filterSpy = jest
      .spyOn(ProductService, "filterProducts")
      .mockResolvedValue({ errCode: 0, data: [] });

    const req = { query: { isAdmin: "true", page: "1", limit: "12" }, user: { id: 5, role: "customer" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await ProductController.handleFilterProducts(req, res);

    expect(filterSpy).toHaveBeenCalledWith(expect.objectContaining({ isAdmin: false }));
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("ProductController.handleFilterProducts allows isAdmin=true for root/admin callers", async () => {
    const filterSpy = jest
      .spyOn(ProductService, "filterProducts")
      .mockResolvedValue({ errCode: 0, data: [] });

    const req = { query: { isAdmin: "true", page: "1", limit: "12" }, user: { id: 1, role: "root" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await ProductController.handleFilterProducts(req, res);

    expect(filterSpy).toHaveBeenCalledWith(expect.objectContaining({ isAdmin: true }));
  });

  it("chatController.handleChat ignores victim userId from req.body for unauthenticated callers", async () => {
    jest
      .spyOn(SystemSettingService, "getSetting")
      .mockImplementation(async (key, defaultVal) =>
        key === "AI_BOT_ENABLED" ? true : defaultVal
      );
    jest
      .spyOn(geminiConfig.genAI, "getGenerativeModel")
      .mockReturnValue({
        generateContent: jest
          .fn()
          .mockResolvedValueOnce({
            response: {
              text: () => JSON.stringify({ isOrderQuery: true, semanticQuery: "don hang" }),
            },
          })
          .mockResolvedValueOnce({
            response: {
              text: () => JSON.stringify({ reply: "Xin vui lòng đăng nhập để kiểm tra đơn hàng.", recommendedProductIds: [] }),
            },
          }),
      });
    jest.spyOn(ProductService, "filterProducts").mockResolvedValue({ errCode: 0, data: [] });
    const orderSpy = jest.spyOn(db.Order, "findOne");

    const req = {
      body: { message: "Kiểm tra đơn hàng của tôi", userId: 999 },
      user: null,
    };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await chatController.handleChat(req, res);

    expect(orderSpy).not.toHaveBeenCalled();
  });

  it("AdminAIService.generateProductDescription returns escaped HTML fallback when Gemini fails", async () => {
    jest
      .spyOn(SystemSettingService, "getSetting")
      .mockImplementation(async (key, defaultVal) => defaultVal);
    jest
      .spyOn(geminiConfig.genAI, "getGenerativeModel")
      .mockReturnValue({
        generateContent: jest
          .fn()
          .mockRejectedValue(Object.assign(new Error("429 quota exceeded"), { status: 429 })),
      });

    const result = await AdminAIService.generateProductDescription(
      'Laptop <script>alert(1)</script>',
      "RAM 16GB, SSD 512GB"
    );

    expect(result.errCode).toBe(0);
    expect(result.isFallback).toBe(true);
    expect(result.data).toContain("<h3>");
    expect(result.data).not.toContain("<script>");
  });
});
