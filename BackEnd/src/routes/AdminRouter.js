const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/AdminController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const { validate } = require("../middleware/zodMiddleware");
const {
  generateDescriptionSchema,
  syncEmbeddingsSchema,
  emptyActionSchema,
} = require("../utils/zodSchemas");

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRole(["admin"]),
  AdminController.getDashboard
);

router.get(
  "/counters",
  authenticateToken,
  authorizeRole(["admin"]),
  AdminController.getAdminCounters
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

router.post(
  "/generate-description",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(generateDescriptionSchema),
  AdminController.handleGenerateDescription
);

router.get(
  "/revenue-forecast",
  authenticateToken,
  authorizeRole(["admin"]),
  AdminController.handleRevenueForecast
);

router.get(
  "/global-search",
  authenticateToken,
  authorizeRole(["admin"]),
  AdminController.handleGlobalSearch
);

router.get(
  "/vector-status",
  authenticateToken,
  authorizeRole(["admin"]),
  AdminController.handleGetVectorStatus
);

router.post(
  "/sync-embeddings",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(syncEmbeddingsSchema),
  AdminController.handleSyncEmbeddings
);

router.post(
  "/vector-reload",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(emptyActionSchema),
  AdminController.handleReloadVectorIndex
);

module.exports = router;
