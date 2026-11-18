const express = require("express");
const router = express.Router();
const VNpay = require("../controllers/VNpay");
const { authenticateToken } = require("../middleware/authMiddleware");
const { paymentActionLimiter } = require("../middleware/rateLimiter");
const { idempotencyGuard } = require("../middleware/idempotencyMiddleware");

router.post(
  "/create-vnpay-payment",
  authenticateToken,
  paymentActionLimiter,
  idempotencyGuard(),
  VNpay.handleCreateVnpayPayment,
);
router.get("/vnpay-return", VNpay.handleVnpayReturn);
router.get("/vnpay-ipn", VNpay.handleVnpayIPN);
module.exports = router;
