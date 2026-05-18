const express = require("express");
const router = express.Router();
const VoucherController = require("../controller/VoucherController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const { verifyAccessToken } = require("../services/jwtService");

// Middleware to optionally get user info from token
const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    token = req.cookies?.accessToken;
  }

  if (token) {
    const decoded = verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  next();
};

const { validate } = require("../middleware/zodMiddleware");
const { voucherSchema, checkVoucherSchema } = require("../utils/zodSchemas");

// PUBLIC
router.get("/active", VoucherController.handleGetActiveVouchers);
router.post(
  "/check", 
  optionalAuthenticate, 
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
