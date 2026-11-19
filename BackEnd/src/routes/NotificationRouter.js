const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/NotificationController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/zodMiddleware");
const {
  broadcastNotificationSchema,
  idParamSchema,
  emptyActionSchema,
} = require("../utils/zodSchemas");

router.get("/all", authenticateToken, NotificationController.handleGetNotifications);
router.put("/mark-read/:id", authenticateToken, validate(idParamSchema), NotificationController.handleMarkAsRead);
router.put("/mark-all-read", authenticateToken, validate(emptyActionSchema), NotificationController.handleMarkAllAsRead);
router.delete("/delete/:id", authenticateToken, NotificationController.handleDeleteNotification);
router.delete("/clear-all", authenticateToken, NotificationController.handleClearAllNotifications);
router.post(
  "/send-broadcast",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(broadcastNotificationSchema),
  NotificationController.handleSendBroadcastNotification
);

module.exports = router;
