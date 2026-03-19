const NotificationService = require("../services/NotificationService");

const handleGetNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    const role = req.user.role;
    const result = await NotificationService.getNotifications(userId, role, +page, +limit);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

const handleMarkAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await NotificationService.markAsRead(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

const handleMarkAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await NotificationService.markAllAsRead(userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ errCode: -1, errMessage: "Lỗi server." });
  }
};

module.exports = {
  handleGetNotifications,
  handleMarkAsRead,
  handleMarkAllAsRead,
};
