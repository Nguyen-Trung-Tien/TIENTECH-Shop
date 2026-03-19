const express = require("express");
const router = express.Router();
const NotificationController = require("../controller/NotificationController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/all", authenticateToken, NotificationController.handleGetNotifications);
router.put("/mark-read/:id", authenticateToken, NotificationController.handleMarkAsRead);
router.put("/mark-all-read", authenticateToken, NotificationController.handleMarkAllAsRead);

module.exports = router;
