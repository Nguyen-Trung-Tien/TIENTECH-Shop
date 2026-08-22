const express = require("express");
const router = express.Router();
const SystemSettingController = require("../controllers/SystemSettingController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

// Public routes (cho frontend khách hàng đọc các setting public như requireOtp)
router.get("/public", SystemSettingController.handleGetPublicSettings);

// Admin routes (chỉ admin / root mới có quyền xem & cấu hình)
router.get(
  "/admin/all",
  authenticateToken,
  authorizeRole(["admin", "root"]),
  SystemSettingController.handleGetAllSettings
);

router.post(
  "/admin/update",
  authenticateToken,
  authorizeRole(["admin", "root"]),
  SystemSettingController.handleUpdateSetting
);

router.post(
  "/admin/toggle-otp",
  authenticateToken,
  authorizeRole(["admin", "root"]),
  SystemSettingController.handleToggleOtpSetting
);

router.post(
  "/admin/bulk-update",
  authenticateToken,
  authorizeRole(["admin", "root"]),
  SystemSettingController.handleBulkUpdateSettings
);

router.post(
  "/admin/flush-cache",
  authenticateToken,
  authorizeRole(["admin", "root"]),
  SystemSettingController.handleFlushRedisCache
);

router.get(
  "/admin/health",
  authenticateToken,
  authorizeRole(["admin", "root"]),
  SystemSettingController.handleGetSystemHealth
);

module.exports = router;
