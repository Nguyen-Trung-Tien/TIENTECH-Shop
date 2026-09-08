jest.mock("../../src/services/common/EmailService", () => ({
  sendOrderConfirmedEmail: jest.fn().mockResolvedValue(true),
}));

const PaymentService = require("../../src/services/order/PaymentService");
const db = require("../../src/models");

describe("Payment Bypass & Security Integration Tests", () => {
  let testUser;
  let testOrder;

  beforeAll(async () => {
    // Ensure a test user and order exist
    testUser = await db.User.create({
      username: `payuser_${Date.now()}`,
      email: `payment_bypass_${Date.now()}@tientech.test`,
      password: "HashedPassword123!",
      name: "Test Payment User",
      role: "customer",
    });

    testOrder = await db.Order.create({
      userId: testUser.id,
      orderCode: `ORD-TEST-${Date.now()}`,
      totalPrice: 250000,
      shippingAddress: "123 Test Street, Hanoi",
      status: "pending",
      paymentStatus: "unpaid",
      paymentMethod: "vnpay",
    });
  });

  afterAll(async () => {
    try {
      if (testOrder) {
        await db.Payment.destroy({ where: { orderId: testOrder.id } });
        await db.Order.destroy({ where: { id: testOrder.id } });
      }
      if (testUser) {
        await db.User.destroy({ where: { id: testUser.id } });
      }
    } catch (e) {
      console.error("Cleanup error:", e);
    }
  });

  test("Customer cannot forge amount; Payment amount strictly equals order.totalPrice", async () => {
    // Client tries to bypass payment amount by passing amount = 1000 instead of 250000
    const result = await PaymentService.createPayment({
      orderId: testOrder.id,
      method: "vnpay",
      amount: 1000, // Forged amount
      status: "completed", // Forged status
    });

    expect(result.errCode).toBe(0);
    const payment = result.data;
    // Amount must strictly match testOrder.totalPrice (250000), NOT client's 1000
    expect(Number(payment.amount)).toBe(250000);
    // Payment status must NEVER be completed on client creation
    expect(payment.status).toBe("pending");
  });

  test("Duplicate createPayment for same order returns idempotent existing record", async () => {
    const result = await PaymentService.createPayment({
      orderId: testOrder.id,
      method: "vnpay",
      amount: 50000,
    });

    expect(result.errCode).toBe(0);
    expect(Number(result.data.amount)).toBe(250000);
  });

  test("Valid IPN marks payment and order as paid/completed exactly once", async () => {
    const ipnResult = await PaymentService.confirmPaymentFromWebhook({
      orderId: testOrder.id,
      transactionId: `TXN-VNPAY-${Date.now()}`,
      amount: 250000,
      paymentMethod: "vnpay",
      bankCode: "NCB",
    });

    expect(ipnResult.errCode).toBe(0);
    expect(ipnResult.alreadyPaid).toBe(false);

    // Verify database state
    const updatedOrder = await db.Order.findByPk(testOrder.id);
    expect(updatedOrder.paymentStatus).toBe("paid");
    expect(updatedOrder.status).toBe("confirmed");

    const updatedPayment = await db.Payment.findOne({
      where: { orderId: testOrder.id },
    });
    expect(updatedPayment.status).toBe("completed");
  });

  test("Duplicate/replayed IPN does not create duplicate payment and reports already processed", async () => {
    const duplicateResult = await PaymentService.confirmPaymentFromWebhook({
      orderId: testOrder.id,
      transactionId: `TXN-VNPAY-DUPLICATE`,
      amount: 250000,
      paymentMethod: "vnpay",
    });

    expect(duplicateResult.errCode).toBe(0);
    expect(duplicateResult.alreadyPaid).toBe(true);

    // Verify only ONE payment record exists for this orderId
    const count = await db.Payment.count({
      where: { orderId: testOrder.id },
    });
    expect(count).toBe(1);
  });
});
