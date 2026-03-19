const express = require("express");
const router = express.Router();
const VoucherService = require("../services/VoucherService");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

// PUBLIC
router.post("/check", async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const result = await VoucherService.checkVoucher(code, orderTotal);
    res.status(200).json(result);
  } catch (error) {
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
