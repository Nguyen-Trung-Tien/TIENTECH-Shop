const { changePaymentMethod } = require("../../src/services/order/use-cases/OrderStatusUseCase");
const db = require("../../src/models");

describe("changePaymentMethod Unit Tests", () => {
  let mockTransaction;

  beforeEach(() => {
    mockTransaction = {
      commit: jest.fn().mockResolvedValue(true),
      rollback: jest.fn().mockResolvedValue(true),
      LOCK: { UPDATE: "UPDATE" },
    };
    jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTransaction);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Trả về lỗi nếu thiếu orderId hoặc newPaymentMethod", async () => {
    const res = await changePaymentMethod(null, "cod", { id: 1, role: "customer" });
    expect(res.errCode).toBe(1);
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  test("Trả về lỗi nếu phương thức thanh toán không hợp lệ", async () => {
    const res = await changePaymentMethod(10, "bitcoin", { id: 1, role: "customer" });
    expect(res.errCode).toBe(2);
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  test("Trả về lỗi nếu không tìm thấy đơn hàng", async () => {
    jest.spyOn(db.Order, "findByPk").mockResolvedValue(null);
    const res = await changePaymentMethod(999, "cod", { id: 1, role: "customer" });
    expect(res.errCode).toBe(3);
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  test("Từ chối nếu người dùng khác cố thay đổi đơn hàng (không phải chủ đơn và không phải admin)", async () => {
    const mockOrder = {
      id: 10,
      userId: 2, // Owner là user 2
      paymentStatus: "unpaid",
      status: "pending",
      paymentMethod: "vnpay",
    };
    jest.spyOn(db.Order, "findByPk").mockResolvedValue(mockOrder);

    const res = await changePaymentMethod(10, "cod", { id: 1, role: "customer" });
    expect(res.errCode).toBe(4);
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  test("Từ chối nếu đơn hàng đã được thanh toán (paid)", async () => {
    const mockOrder = {
      id: 10,
      userId: 1,
      paymentStatus: "paid",
      status: "pending",
      paymentMethod: "vnpay",
    };
    jest.spyOn(db.Order, "findByPk").mockResolvedValue(mockOrder);

    const res = await changePaymentMethod(10, "cod", { id: 1, role: "customer" });
    expect(res.errCode).toBe(5);
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  test("Từ chối nếu đơn hàng đã hoàn tất hoặc đã hủy", async () => {
    const mockOrder = {
      id: 10,
      userId: 1,
      paymentStatus: "unpaid",
      status: "cancelled",
      paymentMethod: "vnpay",
    };
    jest.spyOn(db.Order, "findByPk").mockResolvedValue(mockOrder);

    const res = await changePaymentMethod(10, "cod", { id: 1, role: "customer" });
    expect(res.errCode).toBe(6);
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  test("Đổi phương thức thanh toán thành công sang COD cho đơn pending chưa trả tiền", async () => {
    const mockOrder = {
      id: 10,
      userId: 1,
      paymentStatus: "unpaid",
      status: "pending",
      paymentMethod: "vnpay",
      confirmationHistory: [],
      save: jest.fn().mockResolvedValue(true),
    };
    jest.spyOn(db.Order, "findByPk").mockResolvedValue(mockOrder);

    const res = await changePaymentMethod(10, "cod", { id: 1, username: "testuser", role: "customer" });
    expect(res.errCode).toBe(0);
    expect(mockOrder.paymentMethod).toBe("cod");
    expect(mockOrder.confirmationHistory.length).toBe(1);
    expect(mockOrder.confirmationHistory[0].action).toBe("change_payment_method");
    expect(mockOrder.confirmationHistory[0].from).toBe("vnpay");
    expect(mockOrder.confirmationHistory[0].to).toBe("cod");
    expect(mockOrder.save).toHaveBeenCalled();
    expect(mockTransaction.commit).toHaveBeenCalled();
  });
});

