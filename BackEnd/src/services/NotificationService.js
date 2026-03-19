const db = require("../models");

const createNotification = async (data) => {
  try {
    const notification = await db.Notification.create(data);
    return { errCode: 0, data: notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const getNotifications = async (userId, role, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    const where = {};
    
    // Nếu là admin, lấy thông báo hệ thống/đơn hàng mới (userId null) hoặc của riêng admin
    // Nếu là user, lấy thông báo của riêng họ
    if (role === 'admin') {
      where.userId = { [db.Sequelize.Op.or]: [userId, null] };
    } else {
      where.userId = userId;
    }

    const { count, rows } = await db.Notification.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return {
      errCode: 0,
      data: rows,
      total: count,
      unreadCount: await db.Notification.count({ where: { ...where, isRead: false } }),
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    console.error("Error getting notifications:", error);
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const markAsRead = async (id) => {
  try {
    const notification = await db.Notification.findByPk(id);
    if (notification) {
      await notification.update({ isRead: true });
    }
    return { errCode: 0, message: "Đã đánh dấu đã đọc." };
  } catch (error) {
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const markAllAsRead = async (userId) => {
  try {
    await db.Notification.update({ isRead: true }, { where: { userId } });
    return { errCode: 0, message: "Đã đánh dấu tất cả đã đọc." };
  } catch (error) {
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
};
