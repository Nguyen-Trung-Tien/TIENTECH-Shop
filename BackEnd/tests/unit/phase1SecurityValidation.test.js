const { validate } = require("../../src/middleware/zodMiddleware");
const {
  createOrderSchema,
  orderSchema,
  updateUserSchema,
  adminUpdateUserSchema,
  broadcastNotificationSchema,
  createPaymentSchema,
  updateReviewSchema,
  createProductSchema,
  registerSchema,
  contactSchema,
} = require("../../src/utils/zodSchemas");
const ContactController = require("../../src/controllers/ContactController");
const NotificationService = require("../../src/services/notification/NotificationService");
const EmailService = require("../../src/services/common/EmailService");
const { checkMaintenanceMode } = require("../../src/middleware/authMiddleware");
const SystemSettingService = require("../../src/services/system/SystemSettingService");
const AuthService = require("../../src/services/user/AuthService");
const ReviewController = require("../../src/controllers/ReviewController");
const ReviewService = require("../../src/services/marketing/ReviewService");
const cloudinaryConfig = require("../../src/config/cloudinaryConfig");
const { idempotencyGuard } = require("../../src/middleware/idempotencyMiddleware");
const redisConfig = require("../../src/config/redis");
const db = require("../../src/models");

describe("Phase 1 Security & Validation Fixes", () => {
  afterEach(async () => {
    await new Promise((resolve) => setImmediate(resolve));
    await new Promise((resolve) => setImmediate(resolve));
    jest.restoreAllMocks();
  });

  describe("Zod v4 Middleware & Schemas", () => {
    test("validate middleware handles ZodError issues cleanly and assigns transformed body", () => {
      const middleware = validate(createOrderSchema);

      const badReq = { body: { shippingAddress: "" }, query: {}, params: {} };
      const badRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const badNext = jest.fn();

      middleware(badReq, badRes, badNext);
      expect(badNext).not.toHaveBeenCalled();
      expect(badRes.status).toHaveBeenCalledWith(400);
      expect(badRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: "VALIDATION_ERROR" })
      );

      const goodReq = {
        body: {
          shippingAddress: "123 Le Loi",
          receiverName: "Nguyen Van A",
          receiverPhone: "0901234567",
          paymentMethod: "COD",
          pointsUsed: "25",
          paymentStatus: "paid",
          paypalDetails: { id: "PP-1", status: "COMPLETED" },
          orderItems: [{ productId: 1, variantId: 2, quantity: 1 }],
        },
        query: {},
        params: {},
      };
      const goodRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const goodNext = jest.fn();

      middleware(goodReq, goodRes, goodNext);
      expect(goodNext).toHaveBeenCalledTimes(1);
      expect(goodReq.body.paymentMethod).toBe("cod");
      expect(goodReq.body.pointsUsed).toBe(25);
      expect(goodReq.body.paypalDetails).toEqual({ id: "PP-1", status: "COMPLETED" });
    });

    test("schemas support required fields for product, user, notification, payment, review", () => {
      expect(orderSchema).toBe(createOrderSchema);

      expect(
        updateUserSchema.safeParse({ body: { role: "admin" } }).success
      ).toBe(false);
      expect(
        adminUpdateUserSchema.safeParse({
          body: { id: 5, username: "admin2", role: "admin", isActive: true },
        }).success
      ).toBe(true);

      const prodRes = createProductSchema.safeParse({
        body: {
          name: "MacBook Pro",
          sku: "MBP-01",
          discount: 10,
          variants: [{ sku: "V1", price: 1000, stock: 5 }],
          specifications: { ram: "16GB" },
        },
      });
      expect(prodRes.success).toBe(true);
      expect(prodRes.data.body.sku).toBe("MBP-01");
      expect(prodRes.data.body.variants).toHaveLength(1);

      expect(
        broadcastNotificationSchema.safeParse({
          body: {
            title: "Sale",
            message: "Big sale today",
            link: "/flash-sale",
            target: "user",
            targetUserId: 12,
          },
        }).success
      ).toBe(true);

      expect(
        createPaymentSchema.safeParse({
          body: { orderId: 10, method: "vnpay", note: "Pay now" },
        }).success
      ).toBe(true);
      expect(
        createPaymentSchema.safeParse({
          body: { orderId: 10, paymentMethod: "vnpay" },
        }).success
      ).toBe(true);

      const revRes = updateReviewSchema.safeParse({ body: { isApproved: false } });
      expect(revRes.success).toBe(true);
      expect(revRes.data.body.isApproved).toBe(false);
    });
  });

  describe("Maintenance Mode Query Bypass Fix", () => {
    test("blocks ?/admin query injection while allowing whitelisted endpoints", async () => {
      jest.spyOn(SystemSettingService, "getSetting").mockImplementation(async (key) => {
        if (key === "MAINTENANCE_MODE") return true;
        return "System under maintenance";
      });

      const attackerReq = {
        originalUrl: "/api/v1/product/get-all-product?/admin",
        headers: {},
      };
      const attackerRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const attackerNext = jest.fn();

      await checkMaintenanceMode(attackerReq, attackerRes, attackerNext);
      expect(attackerNext).not.toHaveBeenCalled();
      expect(attackerRes.status).toHaveBeenCalledWith(503);

      const allowedPaths = [
        "/api/v1/user/refresh-token",
        "/api/v1/user/logout",
        "/api/v1/vnpay/vnpay_ipn?vnp_Amount=1000",
        "/api/v1/vnpay/vnpay-return?vnp_ResponseCode=00",
        "/api/v1/system/public",
        "/api/v1/system-settings/public",
      ];

      for (const p of allowedPaths) {
        const req = { originalUrl: p, headers: {} };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();
        await checkMaintenanceMode(req, res, next);
        expect(next).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe("Idempotency Redis vs Bounded Memory Fallback", () => {
    test("skips memory fallback when Redis is connected and enforces max 1000 keys when offline", async () => {
      jest.spyOn(redisConfig, "isRedisConnected").mockReturnValue(true);
      const getCacheSpy = jest.spyOn(redisConfig, "getCache").mockResolvedValue(null);
      const setCacheSpy = jest.spyOn(redisConfig, "setCache").mockResolvedValue(undefined);

      const middleware = idempotencyGuard({ ttlSeconds: 60 });
      const req = {
        headers: { "x-idempotency-key": "redis-only-key" },
        user: { id: 1 },
        method: "POST",
        baseUrl: "/api/v1/order",
        path: "/create-new-order",
      };
      const res = {
        statusCode: 201,
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn((b) => b),
      };
      await middleware(req, res, () => res.status(201).json({ errCode: 0 }));
      expect(getCacheSpy).toHaveBeenCalled();
      expect(setCacheSpy).toHaveBeenCalled();

      // Switch to offline mode and verify > 1000 keys doesn't fail or grow unboundedly
      jest.spyOn(redisConfig, "isRedisConnected").mockReturnValue(false);
      for (let i = 0; i < 1020; i++) {
        const mReq = {
          headers: { "x-idempotency-key": `mem-key-${i}` },
          user: { id: 2 },
          method: "POST",
          baseUrl: "/api/v1/order",
          path: "/create-new-order",
        };
        const mRes = {
          statusCode: 200,
          setHeader: jest.fn(),
          status: jest.fn().mockReturnThis(),
          json: jest.fn((b) => b),
        };
        await middleware(mReq, mRes, () => mRes.status(200).json({ ok: i }));
      }
    });
  });

  describe("AuthService.resetPassword Brute-Force Lockout", () => {
    test("clears resetToken after 5 failed resetPassword attempts", async () => {
      const saveMock = jest.fn().mockResolvedValue(true);
      const mockUser = {
        email: "brute@tientech.test",
        resetToken: "valid_hashed_token",
        resetTokenExpiresAt: new Date(Date.now() + 600000),
        save: saveMock,
      };
      jest.spyOn(db.User, "findOne").mockResolvedValue(mockUser);

      for (let attempt = 1; attempt <= 4; attempt++) {
        const res = await AuthService.resetPassword(
          "brute@tientech.test",
          "wrong-token",
          "StrongPass1!"
        );
        expect(res.errCode).toBe(1);
        expect(mockUser.resetToken).toBe("valid_hashed_token");
      }

      const fifthRes = await AuthService.resetPassword(
        "brute@tientech.test",
        "wrong-token",
        "StrongPass1!"
      );
      expect(fifthRes.errCode).toBe(2);
      expect(mockUser.resetToken).toBeNull();
      expect(saveMock).toHaveBeenCalled();
    });
  });

  describe("ReviewController Upload After Eligibility Check", () => {
    test("does NOT call uploadToCloudinary if user has not purchased the product", async () => {
      jest
        .spyOn(ReviewService, "checkReviewEligibility")
        .mockResolvedValue({
          errCode: 2,
          errMessage: "Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận hàng",
        });
      const uploadSpy = jest
        .spyOn(cloudinaryConfig, "uploadToCloudinary")
        .mockResolvedValue({ secure_url: "https://cdn.example/img.png" });

      // Valid 1x1 PNG base64 header
      const png1x1 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

      const req = {
        user: { id: 10 },
        body: {
          productId: 55,
          rating: 5,
          comment: "Great product!",
          images: [png1x1],
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await ReviewController.handleCreateReview(req, res);
      expect(uploadSpy).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("Zod v4 Vietnamese Messages, Buy Now Order Payload & Contact API", () => {
    test("Zod v4 returns custom Vietnamese messages for missing required password and product name", () => {
      const regRes = registerSchema.safeParse({
        body: { email: "a@b.com", username: "tester" },
      });
      expect(regRes.success).toBe(false);
      expect(regRes.error.issues.some((i) => i.message === "Mật khẩu là bắt buộc")).toBe(
        true
      );

      const prodRes = createProductSchema.safeParse({ body: {} });
      expect(prodRes.success).toBe(false);
      expect(
        prodRes.error.issues.some((i) => i.message === "Tên sản phẩm không được để trống")
      ).toBe(true);
    });

    test("orderSchema accepts Buy Now payload with cartItemId: null and checkoutMode: 'buy_now'", () => {
      const res = orderSchema.safeParse({
        body: {
          userId: 1,
          shippingAddress: "123 Le Loi",
          receiverName: "Nguyen Van A",
          receiverPhone: "0909123456",
          paymentMethod: "COD",
          checkoutMode: "buy_now",
          pointsUsed: 100,
          orderItems: [
            {
              productId: 33,
              variantId: null,
              quantity: 1,
              cartItemId: null,
            },
          ],
        },
      });
      expect(res.success).toBe(true);
      expect(res.data.body.checkoutMode).toBe("buy_now");
    });

    test("contactSchema validates payload and ContactController persists admin notification + emits socket", async () => {
      expect(
        contactSchema.safeParse({
          body: { name: "A", email: "bad", message: "hi" },
        }).success
      ).toBe(false);

      const emitMock = jest.fn();
      const ioMock = { to: jest.fn(() => ({ emit: emitMock })) };
      const notifSpy = jest
        .spyOn(NotificationService, "createNotification")
        .mockResolvedValue({ errCode: 0, data: { id: 88 } });
      jest
        .spyOn(SystemSettingService, "getSetting")
        .mockResolvedValue("admin@tientech.test");
      const emailSpy = jest
        .spyOn(EmailService, "sendEmail")
        .mockResolvedValue(true);

      const req = {
        app: { get: jest.fn(() => ioMock) },
        body: {
          name: "Le Minh <script>",
          email: "minh@tientech.test",
          phone: "0901112222",
          subject: "tuvansanpham",
          message: "Cần tư vấn màn hình 4K hợp góc setup tối giản.",
        },
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await ContactController.handleSubmitContact(req, res);
      await new Promise((resolve) => setImmediate(resolve));

      expect(notifSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: null,
          type: "system",
          metadata: expect.objectContaining({
            source: "contact_form",
            email: "minh@tientech.test",
          }),
        }),
        null,
        ioMock
      );
      expect(emailSpy).toHaveBeenCalledWith(
        "admin@tientech.test",
        expect.stringContaining("Le Minh"),
        expect.stringContaining("&lt;script&gt;")
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ errCode: 0 })
      );
    });
  });
});
