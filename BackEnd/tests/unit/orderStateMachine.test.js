const {
  validateCustomerStatusTransition,
  validateAdminStatusTransition,
} = require("../../src/services/order/use-cases/OrderStatusUseCase");

describe("Order State Machine Transitions", () => {
  describe("Customer Transitions", () => {
    test("Customer can cancel pending order directly", () => {
      const res = validateCustomerStatusTransition("pending", "cancelled");
      expect(res.valid).toBe(true);
    });

    test("Customer can request cancel from confirmed, processing, shipped, shipping", () => {
      const allowedFrom = ["confirmed", "processing", "shipped", "shipping"];
      for (const fromStatus of allowedFrom) {
        const res = validateCustomerStatusTransition(fromStatus, "cancel_requested");
        expect(res.valid).toBe(true);
        const resDirect = validateCustomerStatusTransition(fromStatus, "cancelled");
        expect(resDirect.valid).toBe(true);
      }
    });

    test("Customer can mark delivered order as completed", () => {
      const res = validateCustomerStatusTransition("delivered", "completed");
      expect(res.valid).toBe(true);
    });

    test("Customer CANNOT mark shipped or shipping order as completed directly", () => {
      const resShipped = validateCustomerStatusTransition("shipped", "completed");
      expect(resShipped.valid).toBe(false);
      expect(resShipped.message).toMatch(/chỉ có thể xác nhận hoàn thành khi đơn hàng đã giao/i);

      const resShipping = validateCustomerStatusTransition("shipping", "completed");
      expect(resShipping.valid).toBe(false);
    });

    test("Customer cannot arbitrarily change to processing or delivered", () => {
      expect(validateCustomerStatusTransition("pending", "processing").valid).toBe(false);
      expect(validateCustomerStatusTransition("pending", "delivered").valid).toBe(false);
    });
  });

  describe("Admin Transitions", () => {
    test("Admin can move pending -> confirmed or cancelled", () => {
      expect(validateAdminStatusTransition("pending", "confirmed").valid).toBe(true);
      expect(validateAdminStatusTransition("pending", "cancelled").valid).toBe(true);
      expect(validateAdminStatusTransition("pending", "delivered").valid).toBe(false);
    });

    test("Admin handles cancel_requested by approving (cancelled) or rejecting (confirmed/processing)", () => {
      expect(validateAdminStatusTransition("cancel_requested", "cancelled").valid).toBe(true);
      expect(validateAdminStatusTransition("cancel_requested", "confirmed").valid).toBe(true);
      expect(validateAdminStatusTransition("cancel_requested", "processing").valid).toBe(true);
      expect(validateAdminStatusTransition("cancel_requested", "shipped").valid).toBe(false);
    });

    test("Admin can advance pipeline confirmed -> processing -> shipping/shipped -> delivered -> completed", () => {
      expect(validateAdminStatusTransition("confirmed", "processing").valid).toBe(true);
      expect(validateAdminStatusTransition("processing", "shipping").valid).toBe(true);
      expect(validateAdminStatusTransition("processing", "shipped").valid).toBe(true);
      expect(validateAdminStatusTransition("shipping", "delivered").valid).toBe(true);
      expect(validateAdminStatusTransition("shipped", "delivered").valid).toBe(true);
      expect(validateAdminStatusTransition("delivered", "completed").valid).toBe(true);
    });

    test("Admin cannot transition cancelled or returned orders", () => {
      expect(validateAdminStatusTransition("cancelled", "confirmed").valid).toBe(false);
      expect(validateAdminStatusTransition("returned", "completed").valid).toBe(false);
    });
  });
});
