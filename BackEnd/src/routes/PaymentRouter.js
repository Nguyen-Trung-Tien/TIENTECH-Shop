const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/PaymentController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const { paymentActionLimiter } = require("../middleware/rateLimiter");
const { idempotencyGuard } = require("../middleware/idempotencyMiddleware");
const { validate } = require("../middleware/zodMiddleware");
const {
  createPaymentSchema,
  updatePaymentSchema,
  completePaymentSchema,
  refundPaymentSchema,
  orderSchema,
  paypalCaptureSchema,
} = require("../utils/zodSchemas");

router.get(
  "/get-all-payment",
  authenticateToken,
  authorizeRole(["admin"]),
  PaymentController.handleGetAllPayments
);
router.get(
  "/get-payment-summary",
  authenticateToken,
  authorizeRole(["admin"]),
  PaymentController.handleGetPaymentSummary
);
router.get(
  "/get-payment/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  PaymentController.handleGetPaymentById
);
router.post(
  "/create-payment/",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  paymentActionLimiter,
  idempotencyGuard(),
  validate(createPaymentSchema),
  PaymentController.handleCreatePayment
);
router.delete(
  "/delete-payment/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  PaymentController.handleDeletePayment
);
router.put(
  "/update-payment/:orderId",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(updatePaymentSchema),
  PaymentController.handleUpdatePayment
);
router.put(
  "/payment-complete/:id/complete",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(completePaymentSchema),
  PaymentController.handleCompletePayment
);
router.put(
  "/payment-refund/:id/refund",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(refundPaymentSchema),
  PaymentController.handleRefundPayment
);
router.post(
  "/paypal/create-order",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  paymentActionLimiter,
  idempotencyGuard(),
  validate(orderSchema),
  PaymentController.handleCreatePaypalOrder
);
router.post(
  "/paypal/capture-order",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  paymentActionLimiter,
  idempotencyGuard(),
  validate(paypalCaptureSchema),
  PaymentController.handleCapturePaypalOrder
);

module.exports = router;
