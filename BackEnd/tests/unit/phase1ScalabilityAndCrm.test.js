jest.mock("../../src/config/redis", () => {
  const actual = jest.requireActual("../../src/config/redis");
  return {
    ...actual,
    getCache: jest.fn().mockResolvedValue(null),
    setCache: jest.fn().mockResolvedValue(true),
    deleteCache: jest.fn().mockResolvedValue(true),
  };
});

const db = require("../../src/models");
const redisConfig = require("../../src/config/redis");
const geminiConfig = require("../../src/config/gemini");
const systemSettingService = require("../../src/services/system/SystemSettingService");
const PaymentService = require("../../src/services/order/PaymentService");
const CartService = require("../../src/services/order/CartService");
const ContactService = require("../../src/services/common/ContactService");
const NotificationService = require("../../src/services/notification/NotificationService");
const EmailService = require("../../src/services/common/EmailService");
const FengShuiService = require("../../src/services/ai/FengShuiService");
const productRecommendation = require("../../src/services/product/productRecommendation");

describe("Phase 1 Scalability, Hygiene, CRM & FengShui Tests", () => {
  beforeEach(() => {
    systemSettingService._clearLocal();
    redisConfig.getCache.mockClear().mockResolvedValue(null);
    redisConfig.setCache.mockClear().mockResolvedValue(true);
    redisConfig.deleteCache.mockClear().mockResolvedValue(true);
  });

  afterEach(async () => {
    systemSettingService._clearLocal();
    await new Promise((resolve) => setImmediate(resolve));
    jest.restoreAllMocks();
  });

  describe("SystemSettingService Local TTL Cache & Invalidation", () => {
    test("getSetting caches locally for 10s (1 DB call for 2 reads) and setSetting updates & invalidates public cache", async () => {
      const findSpy = jest.spyOn(db.SystemSetting, "findOne").mockResolvedValue({
        key: "STORE_NAME",
        value: "TIENTECH Pro",
        category: "store",
        isPublic: true,
      });

      const first = await systemSettingService.getSetting("STORE_NAME");
      const second = await systemSettingService.getSetting("STORE_NAME");
      expect(first).toBe("TIENTECH Pro");
      expect(second).toBe("TIENTECH Pro");
      expect(findSpy).toHaveBeenCalledTimes(1);

      const mockRecord = {
        key: "STORE_NAME",
        value: "TIENTECH Pro",
        category: "store",
        isPublic: true,
        description: "Store name",
        update: jest.fn().mockResolvedValue(true),
      };
      findSpy.mockResolvedValueOnce(mockRecord);

      await systemSettingService.setSetting("STORE_NAME", "TIENTECH Updated");
      const third = await systemSettingService.getSetting("STORE_NAME");
      expect(third).toBe("TIENTECH Updated");
      expect(redisConfig.deleteCache).toHaveBeenCalledWith("system:settings:public");
    });

    test("getPublicSettings caches result locally/Redis and is invalidated by setSetting", async () => {
      const findAllSpy = jest
        .spyOn(db.SystemSetting, "findAll")
        .mockResolvedValue([
          { key: "STORE_NAME", value: "TIENTECH Store" },
          { key: "MAINTENANCE_MODE", value: "false" },
        ]);

      const first = await systemSettingService.getPublicSettings();
      const second = await systemSettingService.getPublicSettings();
      expect(first.errCode).toBe(0);
      expect(first.data).toEqual({
        STORE_NAME: "TIENTECH Store",
        MAINTENANCE_MODE: false,
      });
      expect(second.data).toEqual(first.data);
      expect(findAllSpy).toHaveBeenCalledTimes(1);

      jest.spyOn(db.SystemSetting, "findOne").mockResolvedValue(null);
      jest
        .spyOn(db.SystemSetting, "create")
        .mockImplementation(async (payload) => payload);
      await systemSettingService.setSetting("MAINTENANCE_MODE", "true");

      findAllSpy.mockResolvedValueOnce([
        { key: "STORE_NAME", value: "TIENTECH Store" },
        { key: "MAINTENANCE_MODE", value: "true" },
      ]);
      const afterReset = await systemSettingService.getPublicSettings();
      expect(afterReset.data.MAINTENANCE_MODE).toBe(true);
      expect(findAllSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("PaymentService SQL Aggregation & Query Safety", () => {
    test("getPaymentSummary uses GROUP BY SQL aggregation and aggregates counts/amounts", async () => {
      const findAllSpy = jest.spyOn(db.Payment, "findAll").mockResolvedValue([
        { status: "completed", method: "vnpay", totalAmount: "2500000", txCount: "3" },
        { status: "pending", method: "cod", totalAmount: "900000", txCount: "2" },
        { status: "refunded", method: "paypal", totalAmount: "500000", txCount: "1" },
      ]);

      const res = await PaymentService.getPaymentSummary();
      expect(res.errCode).toBe(0);
      expect(res.data).toEqual({
        totalRevenue: 2500000,
        pendingAmount: 900000,
        refundedAmount: 500000,
        onlineCount: 4,
        codCount: 2,
        totalTransactions: 6,
      });
      expect(findAllSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          group: ["status", "method"],
          raw: true,
        }),
      );
    });

    test("getAllPayments allowlists orderBy and neither getAllPayments nor getPaymentById mutates DB", async () => {
      const findAndCountSpy = jest
        .spyOn(db.Payment, "findAndCountAll")
        .mockResolvedValue({
          count: 1,
          rows: [
            {
              toJSON: () => ({
                id: 10,
                orderId: 55,
                transactionId: null,
                order: { orderCode: "ORD202601" },
              }),
            },
          ],
        });
      const findByPkSpy = jest.spyOn(db.Payment, "findByPk").mockResolvedValue({
        id: 10,
        orderId: 55,
        transactionId: null,
        order: { orderCode: "ORD202601" },
      });
      const updateSpy = jest.spyOn(db.Payment, "update").mockResolvedValue([1]);

      const listRes = await PaymentService.getAllPayments({
        orderBy: "id; DROP TABLE Payments--",
        order: "INVALID_DIR",
      });
      const detailRes = await PaymentService.getPaymentById(10);

      expect(listRes.errCode).toBe(0);
      expect(listRes.data[0].transactionId).toBe("DH202601");
      expect(findAndCountSpy.mock.calls[0][0].order).toEqual([["createdAt", "DESC"]]);
      expect(detailRes.errCode).toBe(0);
      expect(updateSpy).not.toHaveBeenCalled();
      expect(findByPkSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("CartService Batched Validation", () => {
    test("validateCart batches Product and ProductVariant lookups without N+1 findByPk calls", async () => {
      const productFindAllSpy = jest
        .spyOn(db.Product, "findAll")
        .mockResolvedValue([
          {
            id: 1,
            name: "Chuột Gaming",
            isActive: true,
            hasVariants: false,
            totalStock: 10,
            basePrice: 500000,
            discount: 0,
            images: [{ imageUrl: "/mouse.png", isPrimary: true }],
          },
          {
            id: 2,
            name: "Bàn phím cơ",
            isActive: true,
            hasVariants: true,
            totalStock: 5,
            basePrice: 1200000,
            discount: 0,
            images: [{ imageUrl: "/kb.png", isPrimary: true }],
          },
        ]);
      const variantFindAllSpy = jest
        .spyOn(db.ProductVariant, "findAll")
        .mockResolvedValue([
          {
            id: 22,
            productId: 2,
            isActive: true,
            stock: 8,
            price: 1500000,
            discount: 0,
          },
        ]);
      const findByPkSpy = jest.spyOn(db.Product, "findByPk");

      const res = await CartService.validateCart(1, [
        { productId: 1, quantity: 2, price: 500000 },
        { productId: 2, variantId: 22, quantity: 1, price: 1500000 },
      ]);

      expect(res.errCode).toBe(0);
      expect(res.data.totalAmount).toBe(2500000);
      expect(res.data.hasChanged).toBe(false);
      expect(productFindAllSpy).toHaveBeenCalledTimes(1);
      expect(variantFindAllSpy).toHaveBeenCalledTimes(1);
      expect(findByPkSpy).not.toHaveBeenCalled();
    });
  });

  describe("ContactService CRM Workflow", () => {
    test("createTicket wraps creation in transaction and dispatches notification linking to /admin/contacts", async () => {
      const mockTx = {
        commit: jest.fn().mockResolvedValue(true),
        rollback: jest.fn().mockResolvedValue(true),
        LOCK: { UPDATE: "UPDATE" },
      };
      jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTx);
      jest.spyOn(db.ContactTicket, "create").mockResolvedValue({
        id: 15,
        ticketCode: "TK998877",
        subject: "Hỗ trợ Bảo hành / Sửa chữa",
        status: "open",
      });
      const notifSpy = jest
        .spyOn(NotificationService, "createNotification")
        .mockResolvedValue({ errCode: 0, data: { id: 44 } });
      jest.spyOn(systemSettingService, "getSetting").mockResolvedValue("");

      const ioMock = { to: jest.fn(() => ({ emit: jest.fn() })) };
      const res = await ContactService.createTicket(
        {
          name: "Nguyễn An",
          email: "an@example.com",
          phone: "0909123456",
          subject: "baohanh",
          message: "Bàn phím bị kẹt switch sau 2 tuần.",
        },
        ioMock,
      );

      expect(res.errCode).toBe(0);
      expect(res.data).toEqual({
        id: 15,
        ticketCode: "TK998877",
        subject: "Hỗ trợ Bảo hành / Sửa chữa",
        status: "open",
      });
      expect(mockTx.commit).toHaveBeenCalledTimes(1);
      expect(notifSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          link: "/admin/contacts",
          metadata: expect.objectContaining({
            ticketId: 15,
            ticketCode: "TK998877",
          }),
        }),
        null,
        ioMock,
      );
    });

    test("updateTicket updates status/reply inside transaction and sends escaped HTML reply email when enabled", async () => {
      const mockTx = {
        commit: jest.fn().mockResolvedValue(true),
        rollback: jest.fn().mockResolvedValue(true),
        LOCK: { UPDATE: "UPDATE" },
      };
      jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTx);
      const mockTicket = {
        id: 15,
        ticketCode: "TK998877",
        name: "Nguyễn <An>",
        email: "an@example.com",
        subject: "Hỗ trợ Bảo hành",
        message: "Cần hỗ trợ <script>",
        status: "open",
        update: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(db.ContactTicket, "findByPk").mockResolvedValue(mockTicket);
      const emailSpy = jest.spyOn(EmailService, "sendEmail").mockResolvedValue(true);

      const res = await ContactService.updateTicket(
        15,
        {
          adminReply: "Shop sẽ đổi mới <b>ngay hôm nay</b>.",
          sendEmailReply: true,
        },
        { id: 3 },
      );

      expect(res.errCode).toBe(0);
      expect(res.emailSent).toBe(true);
      expect(mockTicket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "resolved",
          repliedBy: 3,
          adminReply: "Shop sẽ đổi mới <b>ngay hôm nay</b>.",
        }),
        { transaction: mockTx },
      );
      expect(mockTx.commit).toHaveBeenCalledTimes(1);
      expect(emailSpy).toHaveBeenCalledWith(
        "an@example.com",
        expect.stringContaining("#TK998877"),
        expect.stringContaining("&lt;b&gt;ngay hôm nay&lt;/b&gt;"),
      );
    });
  });

  describe("FengShuiService & ProductRecommendation Fixes", () => {
    test("FengShuiService passes systemInstruction, falls back when 0 color hits, and returns fsData", async () => {
      const productFindSpy = jest
        .spyOn(db.Product, "findAll")
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([
          {
            id: 7,
            name: "Laptop Ultrabook",
            basePrice: 20000000,
            discount: 10,
            images: [{ imageUrl: "/lap.png", isPrimary: true }],
          },
        ])
        .mockResolvedValueOnce([
          {
            toJSON: () => ({
              id: 7,
              name: "Laptop Ultrabook",
              slug: "laptop-ultrabook",
              basePrice: 20000000,
              discount: 10,
              images: [{ imageUrl: "/lap.png", isPrimary: true }],
            }),
          },
        ]);

      jest.spyOn(systemSettingService, "getSetting").mockResolvedValue("gemini-3.8-flash");
      const genSpy = jest
        .spyOn(geminiConfig.genAI.models, "generateContent")
        .mockResolvedValue({
          text: JSON.stringify({
            reply: "Gợi ý màu hợp mệnh Kim.",
            recommendedProducts: [7],
          }),
        });

      const res = await FengShuiService.getFengShuiAdvice({
        birthYear: 1993,
        gender: "female",
        message: "Tư vấn laptop đi làm",
        history: [{ role: "user", content: "Xin chào" }],
      });

      expect(res.errCode).toBe(0);
      expect(res.data.fsData).toBeDefined();
      expect(res.data.fsData.year).toBe(1993);
      expect(res.data.recommendedProducts).toHaveLength(1);
      expect(productFindSpy).toHaveBeenCalledTimes(3);
      expect(genSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            systemInstruction: expect.stringContaining("1993"),
            responseMimeType: "application/json",
          }),
          contents: [
            { role: "user", parts: [{ text: "Xin chào" }] },
            { role: "user", parts: [{ text: "Tư vấn laptop đi làm" }] },
          ],
        }),
      );
    });

    test("recommendFortuneProducts supports gender, attribute/variant color matching, and 0-hit fallback", async () => {
      const findSpy = jest
        .spyOn(db.Product, "findAndCountAll")
        .mockResolvedValueOnce({ count: 0, rows: [] })
        .mockResolvedValueOnce({
          count: 1,
          rows: [
            {
              toJSON: () => ({
                id: 50,
                name: "iPhone 16 Pro",
                basePrice: 28000000,
                discount: 0,
                specifications: {},
                attributes: [
                  { value: "Bạc Titan", attribute: { code: "color", name: "Màu sắc" } },
                ],
                variants: [
                  {
                    id: 501,
                    price: 28000000,
                    discount: 0,
                    stock: 5,
                    isActive: true,
                    attributeValues: { Color: "Silver" },
                  },
                ],
                images: [{ imageUrl: "/ip.png", isPrimary: true }],
              }),
            },
          ],
        });

      const res = await productRecommendation.recommendFortuneProducts({
        birthYear: 1995,
        gender: "male",
        sortBy: "newest",
        page: 1,
        limit: 6,
      });

      expect(res.errCode).toBe(0);
      expect(res.isFallback).toBe(true);
      expect(res.data).toHaveLength(1);
      expect(res.data[0].isLuckyColor).toBe(true);
      expect(findSpy).toHaveBeenCalledTimes(2);
      expect(findSpy.mock.calls[0][0].order).toEqual([["createdAt", "DESC"]]);
    });
  });
});
