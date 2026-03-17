const express = require("express");
const router = express.Router();
const PaymentController = require("../controller/PaymentController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

router.get(
  "/get-all-payment",
  authenticateToken,
  authorizeRole(["admin"]),
  PaymentController.handleGetAllPayments
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
  PaymentController.handleUpdatePayment
);
router.put(
  "/payment-complete/:id/complete",
  authenticateToken,
  authorizeRole(["admin"]),
  PaymentController.handleCompletePayment
);
router.put(
  "/payment-refund/:id/refund",
  authenticateToken,
  authorizeRole(["admin"]),
  PaymentController.handleRefundPayment
);

module.exports = router;
