const express = require("express");
const router = express.Router();
const SystemSettingController = require("../controllers/SystemSettingController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const { adminMutationLimiter } = require("../middleware/rateLimiter");
const { validate } = require("../middleware/zodMiddleware");
const {
  updateSystemSettingSchema,
  bulkSystemSettingSchema,
  toggleOtpSchema,
  emptyActionSchema,
} = require("../utils/zodSchemas");

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
  adminMutationLimiter,
  validate(updateSystemSettingSchema),
  SystemSettingController.handleUpdateSetting
);

router.post(
  "/admin/toggle-otp",
  authenticateToken,
  authorizeRole(["admin", "root"]),
  adminMutationLimiter,
  validate(toggleOtpSchema),
  SystemSettingController.handleToggleOtpSetting
);

router.post(
  "/admin/bulk-update",
  authenticateToken,
  authorizeRole(["admin", "root"]),
  adminMutationLimiter,
  validate(bulkSystemSettingSchema),
  SystemSettingController.handleBulkUpdateSettings
);

router.post(
  "/admin/flush-cache",
  authenticateToken,
  authorizeRole(["admin", "root"]),
  adminMutationLimiter,
  validate(emptyActionSchema),
  SystemSettingController.handleFlushRedisCache
);

router.get(
  "/admin/health",
  authenticateToken,
  authorizeRole(["admin", "root"]),
  SystemSettingController.handleGetSystemHealth
);

module.exports = router;
