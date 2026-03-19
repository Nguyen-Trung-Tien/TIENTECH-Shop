const db = require("../src/models");
const VoucherService = require("../src/services/VoucherService");

describe("VoucherService", () => {
  let user;
  let voucher;

  beforeAll(async () => {
    // Create test user
    user = await db.User.create({
      username: "testuser",
      email: "testuser@example.com",
      password: "password", // password hash not required for this test
      role: "customer",
    });

    // Create a voucher with perUserUsage = 1
    voucher = await db.Voucher.create({
      code: "TEST10",
      type: "percentage",
      value: 10,
      minOrderValue: 10,
      maxDiscount: 50,
      maxUsage: 5,
      perUserUsage: 1,
      expiryDate: new Date(Date.now() + 3600 * 1000),
      isActive: true,
    });
  });

  afterAll(async () => {
    await db.VoucherUsage.destroy({ where: { userId: user.id } });
    await db.Voucher.destroy({ where: { id: voucher.id } });
    await db.User.destroy({ where: { id: user.id } });
  });

  it("should validate voucher successfully for eligible order total", async () => {
    const result = await VoucherService.validateVoucher("TEST10", 200, user.id);

    expect(result.errCode).toBe(0);
    expect(result.data.discountAmount).toBe(20);
    expect(result.data.code).toBe("TEST10");
  });

  it("should apply voucher and then block second apply for same user when perUserUsage = 1", async () => {
    const applyResult = await VoucherService.applyVoucher({
      code: "TEST10",
      orderTotal: 200,
      userId: user.id,
      orderId: null,
    });

    expect(applyResult.errCode).toBe(0);
    expect(applyResult.data.discountAmount).toBe(20);

    const againResult = await VoucherService.applyVoucher({
      code: "TEST10",
      orderTotal: 200,
      userId: user.id,
      orderId: null,
    });

    expect(againResult.errCode).toBe(4);
    expect(againResult.errMessage).toContain("đã sử dụng mã này");
  });
});
