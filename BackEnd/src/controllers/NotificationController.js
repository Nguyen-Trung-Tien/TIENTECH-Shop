const NotificationService = require("../services/notification/NotificationService");

const handleGetNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, type = null } = req.query;
    const userId = req.user.id;
    const role = req.user.role;
    const result = await NotificationService.getNotifications(
      userId,
      role,
      +page,
      +limit,
      type
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

const handleMarkAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const result = await NotificationService.markAsRead(id, userId, role);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

const handleMarkAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const result = await NotificationService.markAllAsRead(userId, role);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

const handleDeleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const result = await NotificationService.deleteNotification(id, userId, role);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

const handleClearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const result = await NotificationService.clearAllNotifications(userId, role);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

const handleSendBroadcastNotification = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ errCode: 403, errMessage: "Không có quyền quản trị." });
    }

    const { title, message, type, link, target, targetUserId } = req.body;
    if (!title || !message) {
      return res.status(400).json({ errCode: 1, errMessage: "Tiêu đề và nội dung là bắt buộc." });
    }

    const io = req.app.get("io");
    const result = await NotificationService.sendBroadcastNotification(
      { title, message, type, link, target, targetUserId },
      io
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("handleSendBroadcastNotification error:", error);
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

module.exports = {
  handleGetNotifications,
  handleMarkAsRead,
  handleMarkAllAsRead,
  handleDeleteNotification,
  handleClearAllNotifications,
  handleSendBroadcastNotification,
};
