const axios = require("axios");
const db = require("../../src/models");
const SystemSettingService = require("../../src/services/system/SystemSettingService");
const OrderCreationUseCase = require("../../src/services/order/use-cases/OrderCreationUseCase");
const PaypalService = require("../../src/services/order/PaypalService");
const PaymentService = require("../../src/services/order/PaymentService");

describe("PayPal Server-Side Orders API & Anti-Bypass Security", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  test("OrderCreationUseCase blocks forged client paymentStatus=paid even with COMPLETED paypalDetails", async () => {
    const mockTx = {
      commit: jest.fn().mockResolvedValue(true),
      rollback: jest.fn().mockResolvedValue(true),
      LOCK: { UPDATE: "UPDATE" },
    };
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTx);
    jest.spyOn(SystemSettingService, "getSetting").mockImplementation(async (_k, d) => d);
    jest.spyOn(db.Product, "findByPk").mockResolvedValue({
      id: 1,
      name: "Laptop Pro",
      basePrice: 10000000,
      discount: 0,
      totalStock: 10,
      isActive: true,
      hasVariants: false,
      decrement: jest.fn().mockResolvedValue(true),
      increment: jest.fn().mockResolvedValue(true),
    });
    jest.spyOn(db.ProductImage, "findAll").mockResolvedValue([]);
    const orderCreateSpy = jest.spyOn(db.Order, "create");

    const res = await OrderCreationUseCase.createOrder(
      {
        userId: 7,
        shippingAddress: "123 Le Loi, HCM",
        receiverName: "Tester",
        receiverPhone: "0901234567",
        paymentMethod: "paypal",
        paymentStatus: "paid",
        paypalDetails: { id: "FORGED-PP-999", status: "COMPLETED" },
        orderItems: [{ productId: 1, quantity: 1 }],
      },
      { id: 7, role: "customer" }
    );

    expect(res.errCode).toBe(1);
    expect(res.errMessage).toMatch(/PayPal/i);
    expect(mockTx.rollback).toHaveBeenCalled();
    expect(orderCreateSpy).not.toHaveBeenCalled();
  });

  test("PaypalService fails closed (503) when PAYPAL_CLIENT_SECRET is missing", async () => {
    process.env.PAYPAL_CLIENT_ID = "client_id_only";
    delete process.env.PAYPAL_CLIENT_SECRET;

    expect(PaypalService.isPaypalConfigured()).toBe(false);

    const createRes = await PaypalService.createPaypalOrder({
      orderCode: "ORD1001",
      totalPriceVnd: 500000,
    });
    expect(createRes.errCode).toBe(503);

    const captureRes = await PaypalService.capturePaypalOrder("PP-ORDER-1");
    expect(captureRes.errCode).toBe(503);

    const serviceRes = await PaymentService.createPaypalCheckoutOrder(
      {
        shippingAddress: "HCM",
        receiverName: "User",
        receiverPhone: "0901234567",
        orderItems: [{ productId: 1, quantity: 1 }],
      },
      { id: 7, role: "customer" }
    );
    expect(serviceRes.errCode).toBe(503);
    expect(serviceRes.statusCode).toBe(503);
  });

  test("PaymentService.capturePaypalCheckoutOrder rejects mismatched paypalOrderId or USD amount", async () => {
    process.env.PAYPAL_CLIENT_ID = "test_client_id";
    process.env.PAYPAL_CLIENT_SECRET = "test_client_secret";

    jest.spyOn(db.Order, "findByPk").mockResolvedValue({
      id: 42,
      userId: 7,
      orderCode: "ORD42",
      totalPrice: 2500000,
      paymentMethod: "paypal",
      paymentStatus: "unpaid",
      status: "pending",
    });

    jest.spyOn(db.Payment, "findOne").mockResolvedValue({
      id: 9,
      orderId: 42,
      method: "paypal",
      transactionId: "PP-REAL-ORDER-42",
      note: JSON.stringify({ expectedUsd: "100.00", currency: "USD" }),
    });

    const mismatchIdRes = await PaymentService.capturePaypalCheckoutOrder(
      { orderId: 42, paypalOrderId: "PP-HIJACKED-1" },
      { id: 7, role: "customer" }
    );
    expect(mismatchIdRes.errCode).toBe(4);
    expect(mismatchIdRes.statusCode).toBe(400);

    // Now test mismatched amount returned by PayPal API (paid $1.00 instead of $100.00)
    jest.spyOn(PaypalService, "capturePaypalOrder").mockResolvedValue({
      errCode: 0,
      data: {
        paypalOrderId: "PP-REAL-ORDER-42",
        captureId: "CAP-1",
        status: "COMPLETED",
        amountUsd: "1.00",
        currency: "USD",
        customId: "ORD42",
      },
    });

    const mismatchAmountRes = await PaymentService.capturePaypalCheckoutOrder(
      { orderId: 42, paypalOrderId: "PP-REAL-ORDER-42" },
      { id: 7, role: "customer" }
    );
    expect(mismatchAmountRes.errCode).toBe(4);
    expect(mismatchAmountRes.statusCode).toBe(400);
  });

  test("PaymentService.capturePaypalCheckoutOrder verifies PayPal capture and confirms order", async () => {
    process.env.PAYPAL_CLIENT_ID = "test_client_id";
    process.env.PAYPAL_CLIENT_SECRET = "test_client_secret";

    const mockTx = {
      commit: jest.fn().mockResolvedValue(true),
      rollback: jest.fn().mockResolvedValue(true),
      LOCK: { UPDATE: "UPDATE" },
    };
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTx);

    const mockOrder = {
      id: 55,
      userId: 7,
      orderCode: "ORD55",
      totalPrice: 2500000,
      paymentMethod: "paypal",
      paymentStatus: "unpaid",
      status: "pending",
      confirmationHistory: [],
      save: jest.fn().mockResolvedValue(true),
    };

    jest
      .spyOn(db.Order, "findByPk")
      .mockResolvedValueOnce(mockOrder) // ownership & initial lookup
      .mockResolvedValueOnce(mockOrder) // inside confirmPaymentFromWebhook
      .mockResolvedValueOnce({ ...mockOrder, paymentStatus: "paid", status: "confirmed" }); // reload
    jest.spyOn(db.User, "findByPk").mockResolvedValue(null);

    const mockPayment = {
      id: 12,
      orderId: 55,
      method: "paypal",
      transactionId: "PP-VALID-55",
      status: "pending",
      note: JSON.stringify({ expectedUsd: "100.00", currency: "USD" }),
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(db.Payment, "findOne").mockResolvedValue(mockPayment);

    const postSpy = jest
      .spyOn(axios, "post")
      .mockResolvedValueOnce({ data: { access_token: "pp_tok_123" } })
      .mockResolvedValueOnce({
        data: {
          id: "PP-VALID-55",
          status: "COMPLETED",
          purchase_units: [
            {
              reference_id: "ORD55",
              custom_id: "ORD55",
              payments: {
                captures: [
                  {
                    id: "CAPTURE-777",
                    status: "COMPLETED",
                    amount: { currency_code: "USD", value: "100.00" },
                    custom_id: "ORD55",
                  },
                ],
              },
            },
          ],
        },
      });

    const res = await PaymentService.capturePaypalCheckoutOrder(
      { orderId: 55, paypalOrderId: "PP-VALID-55" },
      { id: 7, role: "customer" }
    );

    expect(postSpy).toHaveBeenCalledTimes(2);
    expect(res.errCode).toBe(0);
    expect(mockOrder.paymentStatus).toBe("paid");
    expect(mockOrder.status).toBe("confirmed");
    expect(mockPayment.status).toBe("completed");
    expect(mockPayment.transactionId).toBe("CAPTURE-777");
    expect(mockTx.commit).toHaveBeenCalled();

    // Flush async setImmediate notification task before Jest tears down
    await new Promise((resolve) => setImmediate(resolve));
  });
});
