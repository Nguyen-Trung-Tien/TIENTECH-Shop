const PaymentService = require("../../src/services/order/PaymentService");
const PaymentController = require("../../src/controllers/PaymentController");
const { refundPaymentSchema } = require("../../src/utils/zodSchemas");
const db = require("../../src/models");

describe("Payment Refund Note & Display Tests", () => {
  let mockTransaction;

  beforeEach(() => {
    mockTransaction = {
      commit: jest.fn().mockResolvedValue(true),
      rollback: jest.fn().mockResolvedValue(true),
      finished: false,
    };
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTransaction);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("refundPaymentSchema validates both note and refundNote correctly", () => {
    const validWithNote = refundPaymentSchema.safeParse({
      params: { id: "12" },
      body: { note: "Lý do hoàn tiền A" },
    });
    expect(validWithNote.success).toBe(true);

    const validWithRefundNote = refundPaymentSchema.safeParse({
      params: { id: "12" },
      body: { refundNote: "Lý do hoàn tiền B" },
    });
    expect(validWithRefundNote.success).toBe(true);

    const validEmpty = refundPaymentSchema.safeParse({
      params: { id: "12" },
      body: {},
    });
    expect(validEmpty.success).toBe(true);
  });

  test("refundPayment updates status, persists note, and returns refundNote in data", async () => {
    const mockPayment = {
      id: 5,
      orderId: 10,
      method: "cod",
      status: "completed",
      note: "",
      save: jest.fn().mockResolvedValue(true),
      toJSON: function () {
        return {
          id: this.id,
          orderId: this.orderId,
          method: this.method,
          status: this.status,
          note: this.note,
        };
      },
    };

    const mockOrder = {
      id: 10,
      paymentStatus: "paid",
      save: jest.fn().mockResolvedValue(true),
    };

    jest.spyOn(db.Payment, "findByPk").mockResolvedValue(mockPayment);
    jest.spyOn(db.Order, "findByPk").mockResolvedValue(mockOrder);

    const refundReason = "Khách hàng yêu cầu hủy đơn và hoàn tiền";
    const res = await PaymentService.refundPayment(5, refundReason);

    expect(res.errCode).toBe(0);
    expect(mockPayment.status).toBe("refunded");
    expect(mockPayment.note).toBe(refundReason);
    expect(mockPayment.save).toHaveBeenCalled();
    expect(res.data.refundNote).toBe(refundReason);
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  test("handleRefundPayment accepts refundNote or note from request body", async () => {
    const req = {
      params: { id: 5 },
      body: { refundNote: "Hoàn tiền do lỗi hệ thống" },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.spyOn(PaymentService, "refundPayment").mockResolvedValue({
      errCode: 0,
      errMessage: "Payment refunded",
      data: { id: 5, note: "Hoàn tiền do lỗi hệ thống", refundNote: "Hoàn tiền do lỗi hệ thống" },
    });

    await PaymentController.handleRefundPayment(req, res);

    expect(PaymentService.refundPayment).toHaveBeenCalledWith(5, "Hoàn tiền do lỗi hệ thống");
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
