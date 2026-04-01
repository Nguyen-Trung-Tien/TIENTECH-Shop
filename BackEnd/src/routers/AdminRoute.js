const express = require("express");
const router = express.Router();
const AdminController = require("../controller/AdminController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

// Đổi từ /get-dashboard thành /dashboard để khớp với Front-End
router.get(
  "/dashboard",
  authenticateToken,
  authorizeRole(["admin"]),
  AdminController.getDashboard
);

router.get(
  "/export-revenue",
  authenticateToken,
  authorizeRole(["admin"]),
  AdminController.handleExportRevenue
);

router.get(
  "/ai-insights",
  authenticateToken,
  authorizeRole(["admin"]),
  AdminController.handleAIInsights
);

router.get(
  "/global-search",
  authenticateToken,
  authorizeRole(["admin"]),
  AdminController.handleGlobalSearch
);

router.post(
  "/sync-embeddings",
  authenticateToken,
  authorizeRole(["admin"]),
  AdminController.handleSyncEmbeddings
);

module.exports = router;
