const express = require("express");
const router = express.Router();
const VoucherService = require("../services/VoucherService");
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

// PUBLIC
router.get("/active", async (req, res) => {
  try {
    const result = await VoucherService.getActiveVouchers();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
});

router.post("/check", optionalAuthenticate, async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const userId = req.user ? req.user.id : null;
    const result = await VoucherService.checkVoucher(code, orderTotal, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in voucher check route:", error);
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
});

// ADMIN ONLY
router.get("/get-all", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  try {
    const result = await VoucherService.getAllVouchers();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
});

router.post("/create", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  try {
    const result = await VoucherService.createVoucher(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
});

router.put("/update/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  try {
    const result = await VoucherService.updateVoucher(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
});

router.delete("/delete/:id", authenticateToken, authorizeRole(["admin"]), async (req, res) => {
  try {
    const result = await VoucherService.deleteVoucher(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
});

module.exports = router;
