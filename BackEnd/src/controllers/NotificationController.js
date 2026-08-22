const NotificationService = require("../services/notification/NotificationService");
const { handleResponse, handleError } = require("../utils/controllerHelper");

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
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleGetNotifications");
  }
};

const handleMarkAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const result = await NotificationService.markAsRead(id, userId, role);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleMarkAsRead");
  }
};

const handleMarkAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const result = await NotificationService.markAllAsRead(userId, role);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleMarkAllAsRead");
  }
};

const handleDeleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const result = await NotificationService.deleteNotification(id, userId, role);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleDeleteNotification");
  }
};

const handleClearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const result = await NotificationService.clearAllNotifications(userId, role);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleClearAllNotifications");
  }
};

const handleSendBroadcastNotification = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        status: "FORBIDDEN",
        statusCode: 403,
        errCode: 403,
        errMessage: "Bạn không có quyền quản trị để gửi thông báo.",
      });
    }

    const { title, message, type, link, target, targetUserId } = req.body;
    if (!title || !message) {
      return res.status(400).json({
        status: "BAD_REQUEST",
        statusCode: 400,
        errCode: 1,
        errMessage: "Tiêu đề và nội dung thông báo là bắt buộc.",
      });
    }

    const io = req.app.get("io");
    const result = await NotificationService.sendBroadcastNotification(
      { title, message, type, link, target, targetUserId },
      io
    );
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleSendBroadcastNotification");
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
