const crypto = require("crypto");
const db = require("../../src/models");
const { Op } = require("sequelize");
const { calculateFinalPrice } = require("../../src/utils/priceHelper");
const { applyFlashSaleToProduct } = require("../../src/services/product/productHelper");
const OrderCreationUseCase = require("../../src/services/order/use-cases/OrderCreationUseCase");
const OrderStatusUseCase = require("../../src/services/order/use-cases/OrderStatusUseCase");
const OrderService = require("../../src/services/order/OrderService");
const CartItemService = require("../../src/services/order/CartItemService");
const VoucherService = require("../../src/services/marketing/VoucherService");
const SystemSettingService = require("../../src/services/system/SystemSettingService");
const EmailService = require("../../src/services/common/EmailService");
const VNpay = require("../../src/controllers/VNpay");
const productSearch = require("../../src/services/product/productSearch");
const productRecommendation = require("../../src/services/product/productRecommendation");
const ReviewService = require("../../src/services/marketing/ReviewService");
const InventoryService = require("../../src/services/common/InventoryService");
const geminiConfig = require("../../src/config/gemini");
const AdminService = require("../../src/services/common/AdminService");
const redisConfig = require("../../src/config/redis");

describe("Phase 2 Business Logic, Loyalty, Multi-Variant Flash Sale & AI Fixes", () => {
  afterEach(async () => {
    await new Promise((resolve) => setImmediate(resolve));
    jest.restoreAllMocks();
  });

  describe("Multi-Variant Flash Sale Pricing", () => {
    test("applies flashSalePrice / basePrice ratio onto each variant price", () => {
      const product = {
        id: 1,
        name: "Laptop Pro",
        basePrice: 20000000,
        discount: 0,
        isFlashSale: true,
        flashSalePrice: 15000000, // 25% off
        flashSaleStart: new Date(Date.now() - 60000),
        flashSaleEnd: new Date(Date.now() + 60000),
        variants: [
          { id: 101, sku: "LP-16G", price: 20000000, discount: 0 },
          { id: 102, sku: "LP-32G", price: 24000000, discount: 0 },
        ],
      };

      expect(calculateFinalPrice(product, product.variants[0])).toBe(15000000);
      expect(calculateFinalPrice(product, product.variants[1])).toBe(18000000);

      const enriched = applyFlashSaleToProduct(product);
      expect(enriched.variants[0].flashSalePrice).toBe(15000000);
      expect(enriched.variants[1].flashSalePrice).toBe(18000000);
      expect(enriched.variants[1].finalPrice).toBe(18000000);
    });
  });

  describe("Mandatory Variant Selection", () => {
    test("CartItemService rejects adding hasVariants=true product without variantId", async () => {
      jest.spyOn(db.Cart, "findOrCreate").mockResolvedValue([{ id: 1 }]);
      jest.spyOn(db.Product, "findByPk").mockResolvedValue({
        id: 10,
        name: "Phone X",
        isActive: true,
        hasVariants: true,
        totalStock: 10,
      });

      await expect(
        CartItemService.createCartItem({ productId: 10, variantId: null, quantity: 1 }, 5)
      ).rejects.toThrow(/phiên bản/i);
    });

    test("OrderCreationUseCase rejects hasVariants=true product without variantId", async () => {
      const mockTx = {
        commit: jest.fn(),
        rollback: jest.fn(),
        LOCK: { UPDATE: "UPDATE" },
      };
      jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTx);
      jest.spyOn(db.Product, "findByPk").mockResolvedValue({
        id: 10,
        name: "Phone X",
        isActive: true,
        hasVariants: true,
        totalStock: 10,
      });

      jest.spyOn(EmailService.emailService, "sendEmail").mockResolvedValue(true);

      const res = await OrderCreationUseCase.createOrder(
        {
          userId: 5,
          shippingAddress: "Hanoi",
          receiverName: "Tester",
          receiverPhone: "0901112222",
          orderItems: [{ productId: 10, variantId: null, quantity: 1 }],
        },
        { id: 5, role: "customer" }
      );

      expect(res.errCode).toBe(4);
      expect(mockTx.rollback).toHaveBeenCalled();
    });
  });

  describe("Loyalty Points Redemption, PayPal Strict Check & Voucher Cancelled Filter", () => {
    test("caps pointsUsed at 10% after voucher, locks user row, and creates order", async () => {
      const mockTx = {
        commit: jest.fn().mockResolvedValue(true),
        rollback: jest.fn().mockResolvedValue(true),
        LOCK: { UPDATE: "UPDATE" },
      };
      jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTx);
      jest.spyOn(SystemSettingService, "getSetting").mockImplementation(async (k, d) => {
        if (k === "DEFAULT_SHIPPING_FEE") return 0;
        if (k === "FREESHIP_MIN_ORDER") return 0;
        if (k === "EMAIL_NOTIFY_USER_ORDER_CREATED") return false;
        if (k === "EMAIL_NOTIFY_ADMIN_NEW_ORDER") return false;
        return d;
      });
      jest.spyOn(db.Product, "findByPk").mockResolvedValue({
        id: 1,
        name: "Mouse Pro",
        basePrice: 1000000,
        discount: 0,
        totalStock: 50,
        isActive: true,
        hasVariants: false,
        decrement: jest.fn().mockResolvedValue(true),
        increment: jest.fn().mockResolvedValue(true),
      });
      jest.spyOn(db.ProductImage, "findAll").mockResolvedValue([]);

      jest.spyOn(VoucherService, "checkVoucher").mockResolvedValue({
        errCode: 0,
        data: { discountAmount: 200000 },
      });
      jest.spyOn(db.Voucher, "findOne").mockResolvedValue({
        id: 3,
        code: "SALE200",
        isActive: true,
        maxUsage: 100,
        usedCount: 1,
        perUserUsage: 1,
        increment: jest.fn().mockResolvedValue(true),
      });
      const usageCountSpy = jest.spyOn(db.VoucherUsage, "count").mockResolvedValue(0);
      jest.spyOn(db.VoucherUsage, "create").mockResolvedValue({});

      const userDecrementSpy = jest.fn().mockResolvedValue(true);
      const userFindSpy = jest.spyOn(db.User, "findByPk").mockResolvedValue({
        id: 7,
        points: 5000, // User has 5000 pts
        decrement: userDecrementSpy,
      });

      const orderCreateSpy = jest.spyOn(db.Order, "create").mockImplementation(async (payload) => ({
        id: 99,
        ...payload,
      }));
      jest.spyOn(db.Cart, "findOne").mockResolvedValue(null);

      // Order 1,000,000 - voucher 200,000 = 800,000 after voucher.
      // Max 10% = 80,000đ = 800 points. Requesting 2000 points should cap to 800 points!
      jest.spyOn(EmailService.emailService, "sendEmail").mockResolvedValue(true);

      const res = await OrderCreationUseCase.createOrder(
        {
          userId: 7,
          shippingAddress: "HCM",
          receiverName: "Tester",
          receiverPhone: "0909998888",
          paymentMethod: "cod",
          voucherCode: "SALE200",
          pointsUsed: 2000,
          orderItems: [{ productId: 1, quantity: 1 }],
        },
        { id: 7, role: "customer" }
      );

      expect(res.errCode).toBe(0);
      expect(usageCountSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: { [Op.ne]: "cancelled" } }),
        })
      );
      expect(userFindSpy).toHaveBeenCalledWith(7, expect.objectContaining({ lock: "UPDATE" }));
      expect(userDecrementSpy).toHaveBeenCalledWith("points", expect.objectContaining({ by: 800 }));
      expect(orderCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          pointsUsed: 800,
          pointsDiscount: 80000,
          totalPrice: 720000,
        }),
        expect.any(Object)
      );
    });

    test("rejects PayPal order claiming paid without COMPLETED status", async () => {
      const mockTx = {
        commit: jest.fn(),
        rollback: jest.fn(),
        LOCK: { UPDATE: "UPDATE" },
      };
      jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTx);
      jest.spyOn(SystemSettingService, "getSetting").mockImplementation(async (k, d) => d);
      jest.spyOn(db.Product, "findByPk").mockResolvedValue({
        id: 1,
        name: "Mouse",
        basePrice: 500000,
        totalStock: 10,
        isActive: true,
        hasVariants: false,
        decrement: jest.fn(),
        increment: jest.fn(),
      });
      jest.spyOn(db.ProductImage, "findAll").mockResolvedValue([]);

      jest.spyOn(EmailService.emailService, "sendEmail").mockResolvedValue(true);

      const res = await OrderCreationUseCase.createOrder(
        {
          userId: 7,
          shippingAddress: "HCM",
          receiverName: "Tester",
          receiverPhone: "0909998888",
          paymentMethod: "paypal",
          paymentStatus: "paid",
          paypalDetails: { id: "PP-123", status: "CREATED" },
          orderItems: [{ productId: 1, quantity: 1 }],
        },
        { id: 7, role: "customer" }
      );

      expect(res.errCode).toBe(1);
      expect(res.errMessage).toMatch(/PayPal/i);
      expect(mockTx.rollback).toHaveBeenCalled();
    });
  });

  describe("OrderStatusUseCase Loyalty Award, Refund & Idempotency", () => {
    test("awards points and upgrades rank on delivered, prevents duplicate award on completed", async () => {
      const mockTx = {
        commit: jest.fn().mockResolvedValue(true),
        rollback: jest.fn().mockResolvedValue(true),
        LOCK: { UPDATE: "UPDATE" },
      };
      jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTx);
      jest.spyOn(redisConfig, "deleteCache").mockResolvedValue();
      jest.spyOn(redisConfig, "deleteCacheByPattern").mockResolvedValue();
      jest.spyOn(SystemSettingService, "getSetting").mockResolvedValue(false);
      jest.spyOn(db.Payment, "findOne").mockResolvedValue({
        id: 1,
        update: jest.fn().mockResolvedValue(true),
      });

      const userUpdateSpy = jest.fn().mockResolvedValue(true);
      const mockUser = { id: 7, points: 950, rank: "Bronze", update: userUpdateSpy };
      jest.spyOn(db.User, "findByPk").mockResolvedValue(mockUser);
      jest.spyOn(EmailService, "sendOrderDeliveredEmail").mockResolvedValue(true);

      // Order totalPrice = 1,000,000 -> +100 points => 1050 points => Silver
      const mockOrder = {
        id: 50,
        orderCode: "ORD50",
        userId: 7,
        totalPrice: 1000000,
        status: "shipping",
        paymentStatus: "unpaid",
        confirmationHistory: [],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(db.Order, "findByPk").mockResolvedValue(mockOrder);

      const res1 = await OrderStatusUseCase.updateOrderStatus(50, "delivered", {
        id: 1,
        role: "admin",
        username: "admin",
      });

      expect(res1.errCode).toBe(0);
      expect(userUpdateSpy).toHaveBeenCalledWith(
        { points: 1050, rank: "Silver" },
        expect.any(Object)
      );
      expect(
        mockOrder.confirmationHistory.some((h) => h.action === "loyalty_points_awarded")
      ).toBe(true);

      // Now customer marks completed -> should NOT award again
      userUpdateSpy.mockClear();
      mockOrder.status = "delivered";
      const res2 = await OrderStatusUseCase.updateOrderStatus(50, "completed", {
        id: 7,
        role: "customer",
        username: "cust",
      });
      expect(res2.errCode).toBe(0);
      expect(userUpdateSpy).not.toHaveBeenCalled();
    });

    test("refunds pointsUsed and marks VoucherUsage cancelled when pending order is cancelled", async () => {
      const mockTx = {
        commit: jest.fn().mockResolvedValue(true),
        rollback: jest.fn().mockResolvedValue(true),
        LOCK: { UPDATE: "UPDATE" },
      };
      jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTx);
      jest.spyOn(SystemSettingService, "getSetting").mockResolvedValue(false);
      jest.spyOn(db.OrderItem, "findAll").mockResolvedValue([]);
      jest.spyOn(db.Voucher, "findOne").mockResolvedValue({
        usedCount: 2,
        save: jest.fn().mockResolvedValue(true),
      });
      const voucherUsageUpdateSpy = jest
        .spyOn(db.VoucherUsage, "update")
        .mockResolvedValue([1]);
      const userUpdateSpy = jest.fn().mockResolvedValue(true);
      jest.spyOn(db.User, "findByPk").mockResolvedValue({
        id: 7,
        points: 200,
        rank: "Bronze",
        update: userUpdateSpy,
      });
      jest.spyOn(EmailService, "sendOrderCancelledEmail").mockResolvedValue(true);
      jest.spyOn(EmailService, "sendAdminOrderCancelledEmail").mockResolvedValue(true);

      const mockOrder = {
        id: 51,
        orderCode: "ORD51",
        userId: 7,
        pointsUsed: 300,
        voucherCode: "V50",
        status: "pending",
        paymentStatus: "unpaid",
        confirmationHistory: [],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(db.Order, "findByPk").mockResolvedValue(mockOrder);

      const res = await OrderStatusUseCase.updateOrderStatus(
        51,
        "cancelled",
        { id: 7, role: "customer", username: "cust" },
        "Changed mind"
      );

      expect(res.errCode).toBe(0);
      expect(voucherUsageUpdateSpy).toHaveBeenCalledWith(
        { status: "cancelled" },
        expect.any(Object)
      );
      expect(userUpdateSpy).toHaveBeenCalledWith(
        { points: 500, rank: "Bronze" },
        expect.any(Object)
      );
    });
  });

  describe("VNPay Retry Payment TxnRef", () => {
    test("creates unique vnp_TxnRef with timestamp and parses orderCode in return/IPN", async () => {
      process.env.VNP_TMN_CODE = "TESTTMN";
      process.env.VNP_HASH_SECRET = "test_vnpay_secret_key_123456";
      process.env.VNP_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
      process.env.VNP_RETURN_URL = "http://localhost:8080/api/v1/vnpay/vnpay-return";
      process.env.FRONTEND_URL = "http://localhost:3000";

      jest.spyOn(OrderService, "getOrderByCode").mockResolvedValue({
        errCode: 0,
        data: {
          id: 77,
          orderCode: "ORD777",
          userId: 5,
          totalPrice: 500000,
          status: "pending",
          paymentStatus: "unpaid",
        },
      });

      const createReq = {
        body: { orderCode: "ORD777" },
        user: { id: 5, role: "customer" },
        headers: {},
        socket: { remoteAddress: "127.0.0.1" },
      };
      const createRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await VNpay.handleCreateVnpayPayment(createReq, createRes);

      const paymentUrl = createRes.json.mock.calls[0][0].data.paymentUrl;
      const urlObj = new URL(paymentUrl);
      const txnRef = urlObj.searchParams.get("vnp_TxnRef");
      expect(txnRef).toMatch(/^ORD777_\d+$/);

      // Verify IPN parses ORD777 from ORD777_timestamp
      const PaymentService = require("../../src/services/order/PaymentService");
      jest.spyOn(PaymentService, "confirmPaymentFromWebhook").mockResolvedValue({ errCode: 0 });

      const ipnParams = {
        vnp_Amount: "50000000",
        vnp_ResponseCode: "00",
        vnp_TransactionNo: "14555",
        vnp_TxnRef: txnRef,
      };
      const signData = Object.keys(ipnParams)
        .sort()
        .map((k) => `${k}=${encodeURIComponent(ipnParams[k]).replace(/%20/g, "+")}`)
        .join("&");
      const secureHash = crypto
        .createHmac("sha512", process.env.VNP_HASH_SECRET)
        .update(signData, "utf-8")
        .digest("hex");

      const ipnRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await VNpay.handleVnpayIPN({ query: { ...ipnParams, vnp_SecureHash: secureHash } }, ipnRes);
      expect(ipnRes.json).toHaveBeenCalledWith({ RspCode: "00", Message: "Confirm Success" });
    });
  });

  describe("Product Filtering, Gemini Model, Email URL, Inventory & AdminStats", () => {
    test("filterProducts supports non-existent slug returning -1, rating/best-seller sort, and VariantAttributeValues", async () => {
      jest.spyOn(db.Brand, "findAll").mockResolvedValue([]);
      const findSpy = jest
        .spyOn(db.Product, "findAndCountAll")
        .mockResolvedValue({ count: 0, rows: [] });

      await productSearch.filterProducts({
        brand: "non-existent-brand",
        ram: "16GB",
        sort: "best-seller",
      });

      const callArg = findSpy.mock.calls[0][0];
      expect(callArg.where.brandId).toBe(-1);
      expect(callArg.order).toEqual([["sold", "DESC"], ["id", "DESC"]]);
      const literalSql = callArg.where[Op.and][0].id[Op.in].val;
      expect(literalSql).toContain("VariantAttributeValues");
    });

    test("gemini defaults to gemini-2.5-flash and InventoryService passes product ID in prompt", async () => {
      expect(geminiConfig.FALLBACK_MODELS[0]).toBe("gemini-2.5-flash");

      jest.spyOn(SystemSettingService, "getSetting").mockResolvedValue("gemini-2.5-flash");
      jest.spyOn(db.Product, "findAll").mockResolvedValue([
        { id: 42, name: "RTX Mouse", totalStock: 2, sold: 35, basePrice: 500000 },
      ]);
      const generateContentMock = jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({ alerts: [{ productId: 42, priority: "HIGH", reason: "Low" }] }),
        },
      });
      jest.spyOn(geminiConfig.genAI, "getGenerativeModel").mockReturnValue({
        generateContent: generateContentMock,
      });
      const NotificationService = require("../../src/services/notification/NotificationService");
      jest.spyOn(NotificationService, "createNotification").mockResolvedValue({ errCode: 0 });

      await InventoryService.checkInventoryAndAlert();
      expect(generateContentMock.mock.calls[0][0]).toContain("[ID: 42]");
    });

    test("EmailService order emails link to /orders without double slash", async () => {
      process.env.FRONTEND_URL = "https://shop.tientech.vn/";
      const sendSpy = jest.spyOn(EmailService.emailService, "sendEmail").mockResolvedValue(true);

      await EmailService.sendOrderCreatedEmail(
        { id: 1, username: "A", email: "a@test.com", receiveEmail: true },
        { id: 10, orderCode: "ORD10", totalPrice: 100000, orderItems: [] }
      );
      expect(sendSpy.mock.calls[0][2]).toContain("https://shop.tientech.vn/orders");
      expect(sendSpy.mock.calls[0][2]).not.toContain("/orders-history");
      expect(sendSpy.mock.calls[0][2]).not.toContain("//orders");
    });

    test("AdminService excludes cancelled orders from topProducts", async () => {
      jest.spyOn(redisConfig, "getCache").mockResolvedValue(null);
      jest.spyOn(redisConfig, "setCache").mockResolvedValue();
      jest.spyOn(db.Product, "count").mockResolvedValue(5);
      jest.spyOn(db.Order, "count").mockResolvedValue(3);
      jest.spyOn(db.Order, "sum").mockResolvedValue(1000000);
      jest.spyOn(db.User, "count").mockResolvedValue(10);
      jest.spyOn(db.Order, "findAll").mockResolvedValue([]);
      jest.spyOn(db.Product, "findAll").mockResolvedValue([]);
      const orderItemSpy = jest.spyOn(db.OrderItem, "findAll").mockResolvedValue([]);

      await AdminService.getDashboardData("today");
      expect(orderItemSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({
              as: "order",
              where: { status: { [Op.ne]: "cancelled" } },
            }),
          ]),
        })
      );
    });
  });

  describe("Regression Fixes: VNPay Underscore Code, Buy-Now Cart Isolation, Order Lock, Recommendations & Reviews", () => {
    test("VNpay.extractOrderCodeFromTxnRef preserves underscores in orderCode and strips retry timestamp", () => {
      expect(VNpay.extractOrderCodeFromTxnRef("ORD_2026_01_1732000000000")).toBe(
        "ORD_2026_01"
      );
      expect(VNpay.extractOrderCodeFromTxnRef("ORD123_1732000000000")).toBe("ORD123");
      expect(VNpay.extractOrderCodeFromTxnRef("ORD_RAW_01")).toBe("ORD_RAW_01");
      expect(VNpay.extractOrderCodeFromTxnRef("")).toBe("");
    });

    test("OrderCreationUseCase preserves server CartItem rows when checkoutMode === 'buy_now'", async () => {
      const mockTx = {
        commit: jest.fn().mockResolvedValue(true),
        rollback: jest.fn().mockResolvedValue(true),
        LOCK: { UPDATE: "UPDATE" },
      };
      jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTx);
      jest.spyOn(redisConfig, "deleteCache").mockResolvedValue();
      jest.spyOn(redisConfig, "deleteCacheByPattern").mockResolvedValue();
      jest.spyOn(SystemSettingService, "getSetting").mockImplementation(async (k, d) => {
        if (k === "DEFAULT_SHIPPING_FEE") return 0;
        if (k === "FREESHIP_MIN_ORDER") return 0;
        if (k === "EMAIL_NOTIFY_USER_ORDER_CREATED") return false;
        if (k === "EMAIL_NOTIFY_ADMIN_NEW_ORDER") return false;
        return d;
      });
      jest.spyOn(db.Product, "findByPk").mockResolvedValue({
        id: 1,
        name: "Mouse",
        basePrice: 500000,
        discount: 0,
        totalStock: 10,
        isActive: true,
        hasVariants: false,
        decrement: jest.fn().mockResolvedValue(true),
        increment: jest.fn().mockResolvedValue(true),
      });
      jest.spyOn(db.ProductImage, "findAll").mockResolvedValue([]);
      jest.spyOn(db.Order, "create").mockResolvedValue({
        id: 77,
        orderCode: "ORD77",
        totalPrice: 500000,
      });
      const cartFindSpy = jest.spyOn(db.Cart, "findOne");
      const cartDestroySpy = jest.spyOn(db.CartItem, "destroy");

      const res = await OrderCreationUseCase.createOrder(
        {
          userId: 7,
          shippingAddress: "HCM",
          receiverName: "Buyer",
          receiverPhone: "0909111222",
          paymentMethod: "COD",
          checkoutMode: "buy_now",
          orderItems: [{ productId: 1, variantId: null, quantity: 1 }],
        },
        { id: 7, role: "customer" }
      );

      expect(res.errCode).toBe(0);
      expect(cartFindSpy).not.toHaveBeenCalled();
      expect(cartDestroySpy).not.toHaveBeenCalled();
    });

    test("OrderStatusUseCase acquires pessimistic row lock when updating order status", async () => {
      const mockTx = {
        commit: jest.fn().mockResolvedValue(true),
        rollback: jest.fn().mockResolvedValue(true),
        LOCK: { UPDATE: "UPDATE" },
      };
      jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTx);
      const findSpy = jest.spyOn(db.Order, "findByPk").mockResolvedValue(null);

      await OrderStatusUseCase.updateOrderStatus(99, "confirmed", {
        id: 1,
        role: "admin",
      });

      expect(findSpy).toHaveBeenCalledWith(
        99,
        expect.objectContaining({
          transaction: mockTx,
          lock: mockTx.LOCK.UPDATE,
        })
      );
    });

    test("getSmartRecommendations skips empty Op.notIn and recommendFortuneProducts sorts & applies flash sale", async () => {
      jest.spyOn(redisConfig, "getCache").mockResolvedValue(null);
      jest.spyOn(redisConfig, "setCache").mockResolvedValue();
      jest.spyOn(db.Product, "findByPk").mockResolvedValue({
        id: 5,
        categoryId: 2,
        embedding: null,
      });
      jest.spyOn(db.OrderItem, "findAll").mockResolvedValue([]);
      const findAllSpy = jest.spyOn(db.Product, "findAll").mockResolvedValue([
        {
          get: () => ({
            id: 6,
            name: "Keyboard",
            slug: "kb",
            basePrice: 1000000,
            discount: 0,
            isFlashSale: true,
            flashSalePrice: 800000,
            flashSaleEnd: new Date(Date.now() + 60000),
            images: [{ imageUrl: "/kb.png", isPrimary: true }],
          }),
        },
      ]);

      const smartRes = await productRecommendation.getSmartRecommendations(5, 4);
      expect(smartRes.errCode).toBe(0);
      const idWhereAnd = findAllSpy.mock.calls[0][0].where.id[Op.and];
      expect(idWhereAnd).toEqual([{ [Op.ne]: 5 }]);
      expect(smartRes.products[0].displayPrice).toBe(800000);

      const fortuneFindSpy = jest
        .spyOn(db.Product, "findAndCountAll")
        .mockResolvedValue({
          count: 1,
          rows: [
            {
              toJSON: () => ({
                id: 8,
                name: "Keycap Blue",
                basePrice: 1000000,
                isFlashSale: true,
                flashSalePrice: 700000,
                flashSaleEnd: new Date(Date.now() + 60000),
                variants: [{ id: 80, price: 2000000, discount: 0, stock: 5 }],
                images: [{ imageUrl: "/kc.png", isPrimary: true }],
              }),
            },
          ],
        });

      const fortuneRes = await productRecommendation.recommendFortuneProducts({
        birthYear: 1998,
        sortBy: "price_asc",
        page: 1,
        limit: 6,
      });

      expect(fortuneFindSpy.mock.calls[0][0].order).toEqual([
        ["basePrice", "ASC"],
        ["createdAt", "DESC"],
      ]);
      expect(fortuneRes.data[0].variants[0].finalPrice).toBe(1400000);
    });

    test("ReviewService admin & user pagination queries enable distinct: true", async () => {
      const findSpy = jest
        .spyOn(db.Review, "findAndCountAll")
        .mockResolvedValue({ count: 0, rows: [] });
      jest.spyOn(db.ReviewReply, "findAll").mockResolvedValue([]);

      await ReviewService.getAllReviewsAdmin(1, 10);
      await ReviewService.getReviewsByUser(3, 1, 10);

      expect(findSpy.mock.calls[0][0].distinct).toBe(true);
      expect(findSpy.mock.calls[1][0].distinct).toBe(true);
    });
  });
});
