const db = require("../../models");

const ALLOWED_TYPES = ["order", "promotion", "system"];

const normalizeType = (type) => {
  if (!type) return "system";
  const t = String(type).toLowerCase();
  if (ALLOWED_TYPES.includes(t)) return t;
  return "system";
};

const isMissingMetadataColumnError = (error) => {
  const msg = String(error?.original?.message || error?.message || "").toLowerCase();
  return (
    (error?.original?.code === "ER_BAD_FIELD_ERROR" || msg.includes("unknown column")) &&
    msg.includes("metadata")
  );
};

const createNotification = async (data, t = null, io = null) => {
  try {
    const payload = {
      userId: data.userId !== undefined ? data.userId : null,
      title: data.title || "Thông báo hệ thống",
      message: data.message || data.content || "",
      type: normalizeType(data.type),
      link: data.link || null,
      metadata: data.metadata || null,
      isRead: false,
    };
    let notification;
    try {
      notification = await db.Notification.create(payload, { transaction: t });
    } catch (createErr) {
      if (isMissingMetadataColumnError(createErr)) {
        const { metadata: _ignored, ...fallbackPayload } = payload;
        notification = await db.Notification.create(fallbackPayload, { transaction: t });
      } else {
        throw createErr;
      }
    }
    
    // Controlled real-time dispatch preventing excess data exposure
    if (io) {
      const sanitized = {
        id: notification.id,
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        link: notification.link,
        metadata: notification.metadata,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      };

      if (payload.userId) {
        // Emit only to the targeted user's room
        io.to(`user_${payload.userId}`).emit("notification", sanitized);
      } else {
        // Admin alerts are strictly restricted to admin_room
        io.to("admin_room").emit("notification", sanitized);
      }
    }
    return { errCode: 0, data: notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const getNotifications = async (userId, role, page = 1, limit = 10, type = null) => {
  try {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (safePage - 1) * safeLimit;
    const where = {};
    const isAdmin = role === "admin" || role === "root";

    if (isAdmin) {
      where.userId = { [db.Sequelize.Op.or]: [userId, null] };
    } else {
      where.userId = userId;
    }

    if (type && type !== "all") {
      if (type === "unread") {
        where.isRead = false;
      } else {
        where.type = normalizeType(type);
      }
    }

    const baseAttributes = [
      "id",
      "userId",
      "title",
      "message",
      "type",
      "isRead",
      "link",
      "createdAt",
    ];

    let queryResult;
    try {
      queryResult = await db.Notification.findAndCountAll({
        where,
        limit: safeLimit,
        offset,
        order: [["createdAt", "DESC"]],
        attributes: [...baseAttributes, "metadata"],
      });
    } catch (queryErr) {
      if (isMissingMetadataColumnError(queryErr)) {
        queryResult = await db.Notification.findAndCountAll({
          where,
          limit: safeLimit,
          offset,
          order: [["createdAt", "DESC"]],
          attributes: baseAttributes,
        });
      } else {
        throw queryErr;
      }
    }

    const { count, rows } = queryResult;

    const unreadCount = await db.Notification.count({
      where: {
        ...(isAdmin
          ? { userId: { [db.Sequelize.Op.or]: [userId, null] } }
          : { userId }),
        isRead: false,
      },
    });

    return {
      errCode: 0,
      errMessage: "OK",
      data: rows,
      total: count,
      unreadCount,
      totalPages: Math.ceil(count / safeLimit),
    };
  } catch (error) {
    console.error("Error getting notifications:", error);
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const markAsRead = async (id, userId, role) => {
  try {
    const isAdmin = role === "admin" || role === "root";
    const notification = await db.Notification.findByPk(id);
    if (notification) {
      if (!isAdmin && notification.userId !== userId) {
        return { errCode: 403, errMessage: "Không có quyền thực hiện." };
      }
      await notification.update({ isRead: true });
    }
    return { errCode: 0, message: "Đã đánh dấu đã đọc." };
  } catch (_error) {
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const markAllAsRead = async (userId, role = "user") => {
  try {
    const isAdmin = role === "admin" || role === "root";
    const where = {};
    if (isAdmin) {
      where.userId = { [db.Sequelize.Op.or]: [userId, null] };
    } else {
      where.userId = userId;
    }
    await db.Notification.update({ isRead: true }, { where });
    return { errCode: 0, message: "Đã đánh dấu tất cả đã đọc." };
  } catch (error) {
    console.error("Error markAllAsRead:", error);
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const deleteNotification = async (id, userId, role) => {
  try {
    const isAdmin = role === "admin" || role === "root";
    const notification = await db.Notification.findByPk(id);
    if (!notification) return { errCode: 1, errMessage: "Không tìm thấy thông báo." };

    if (!isAdmin && notification.userId !== userId) {
      return { errCode: 403, errMessage: "Không có quyền xóa thông báo này." };
    }

    await notification.destroy();
    return { errCode: 0, message: "Đã xóa thông báo." };
  } catch (error) {
    console.error("Error deleteNotification:", error);
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const clearAllNotifications = async (userId, role) => {
  try {
    const isAdmin = role === "admin" || role === "root";
    const where = {};
    if (isAdmin) {
      where.userId = { [db.Sequelize.Op.or]: [userId, null] };
    } else {
      where.userId = userId;
    }
    await db.Notification.destroy({ where });
    return { errCode: 0, message: "Đã xóa toàn bộ thông báo." };
  } catch (error) {
    console.error("Error clearAllNotifications:", error);
    return { errCode: -1, errMessage: "Lỗi server." };
  }
};

const sendBroadcastNotification = async (
  { title, message, type = "system", link = "", target = "all", targetUserId = null },
  io = null
) => {
  try {
    const safeType = normalizeType(type);

    if (target === "user" && targetUserId) {
      const result = await createNotification(
        {
          userId: targetUserId,
          title,
          message,
          type: safeType,
          link,
        },
        null,
        io
      );
      if (result?.errCode === 0) {
        return {
          errCode: 0,
          message: "Đã gửi thông báo đến người dùng thành công!",
          data: result.data,
        };
      }
      return result;
    }

    // Broadcast to all users
    const users = await db.User.findAll({ attributes: ["id"] });
    const notificationRecords = users.map((u) => ({
      userId: u.id,
      title,
      message,
      type: safeType,
      link,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await db.Notification.bulkCreate(notificationRecords);

    if (io) {
      io.emit("notification", { title, message, type: safeType, link });
    }

    return { errCode: 0, message: `Đã gửi thông báo đến ${users.length} người dùng!` };
  } catch (error) {
    console.error("Error sendBroadcastNotification:", error);
    return { errCode: -1, errMessage: "Lỗi khi gửi thông báo." };
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  sendBroadcastNotification,
};
