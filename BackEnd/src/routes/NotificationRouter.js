const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/NotificationController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

router.get("/all", authenticateToken, NotificationController.handleGetNotifications);
router.put("/mark-read/:id", authenticateToken, NotificationController.handleMarkAsRead);
router.put("/mark-all-read", authenticateToken, NotificationController.handleMarkAllAsRead);
router.delete("/delete/:id", authenticateToken, NotificationController.handleDeleteNotification);
router.delete("/clear-all", authenticateToken, NotificationController.handleClearAllNotifications);
router.post("/send-broadcast", authenticateToken, authorizeRole(["admin"]), NotificationController.handleSendBroadcastNotification);

module.exports = router;
