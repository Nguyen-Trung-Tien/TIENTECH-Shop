const db = require("../../src/models");
const OrderQueryUseCase = require("../../src/services/order/use-cases/OrderQueryUseCase");
const AdminService = require("../../src/services/common/AdminService");
const redis = require("../../src/config/redis");

describe("Phase 5: Public Order Tracking & Admin Low-Stock Counters", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("trackOrderPublic returns sanitized order summary when orderCode and phone match", async () => {
    jest.spyOn(db.Order, "findOne").mockResolvedValue({
      id: 99,
      orderCode: "TT-2026-888",
      status: "shipped",
      paymentStatus: "paid",
      paymentMethod: "vnpay",
      totalPrice: 25000000,
      shippingFee: 0,
      discountAmount: 500000,
      receiverName: "Nguyen Van A",
      receiverPhone: "0901234567",
      shippingAddress: "123 Secret Street",
      confirmationHistory: [{ status: "shipped", note: "Đang giao" }],
      createdAt: "2026-11-25T10:00:00.000Z",
      updatedAt: "2026-11-25T12:00:00.000Z",
      user: { id: 5, email: "a@example.com", phone: "0901234567" },
      orderItems: [
        {
          id: 1,
          productId: 10,
          productName: "Laptop Pro",
          quantity: 1,
          price: 25500000,
          productInfo: { id: 10, name: "Laptop Pro", slug: "laptop-pro", images: [] },
        },
      ],
    });

    const res = await OrderQueryUseCase.trackOrderPublic("TT-2026-888", "0901 234 567");
    expect(res.errCode).toBe(0);
    expect(res.data.orderCode).toBe("TT-2026-888");
    expect(res.data.shippingAddress).toBeUndefined();
    expect(res.data.orderItems).toHaveLength(1);
    expect(res.data.orderItems[0].slug).toBe("laptop-pro");
  });

  it("trackOrderPublic rejects mismatched contact", async () => {
    jest.spyOn(db.Order, "findOne").mockResolvedValue({
      orderCode: "TT-2026-888",
      receiverPhone: "0901234567",
      user: { email: "owner@example.com", phone: "0901234567" },
      orderItems: [],
    });

    const res = await OrderQueryUseCase.trackOrderPublic("TT-2026-888", "0999999999");
    expect(res.errCode).toBe(1);
    expect(res.data).toBeUndefined();
  });

  it("getAdminCounters includes lowStockCount", async () => {
    jest.spyOn(redis, "getCache").mockResolvedValue(null);
    jest.spyOn(redis, "setCache").mockResolvedValue(true);
    jest.spyOn(db.Order, "count")
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1);
    jest.spyOn(db.Product, "count").mockResolvedValue(4);

    const res = await AdminService.getAdminCounters();
    expect(res.errCode).toBe(0);
    expect(res.data).toEqual({
      cancelRequestedCount: 2,
      returnRequestedCount: 1,
      lowStockCount: 4,
    });
  });
});
