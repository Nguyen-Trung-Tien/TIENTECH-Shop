const express = require("express");
const router = express.Router();
const VoucherController = require("../controllers/VoucherController");
const {
  authenticateToken,
  optionalAuthenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

const { validate } = require("../middleware/zodMiddleware");
const { voucherSchema, checkVoucherSchema } = require("../utils/zodSchemas");
const { voucherCheckLimiter } = require("../middleware/rateLimiter");

// PUBLIC
router.get("/active", VoucherController.handleGetActiveVouchers);
router.post(
  "/check", 
  optionalAuthenticateToken, 
  voucherCheckLimiter,
  validate(checkVoucherSchema), 
  VoucherController.handleCheckVoucher
);

// ADMIN ONLY
router.get(
  "/get-all",
  authenticateToken,
  authorizeRole(["admin"]),
  VoucherController.handleGetAllVouchers
);

router.post(
  "/create",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(voucherSchema),
  VoucherController.handleCreateVoucher
);

router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  VoucherController.handleUpdateVoucher
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  VoucherController.handleDeleteVoucher
);

module.exports = router;
