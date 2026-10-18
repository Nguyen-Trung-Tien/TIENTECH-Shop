const db = require("../../models");
const BaseService = require("../BaseService");
const { sendVerificationEmail, sendEmailAsync } = require("../common/EmailService");
const SystemSettingService = require("../system/SystemSettingService");
const NotificationService = require("../notification/NotificationService");
const { deleteCache } = require("../../config/redis");
const { 
  hashToken, 
  generateRandomToken, 
  hashUserPassword,
  getUserProfileKey,
  getRefreshTokenKey,
} = require("./AuthHelper");

class UserService extends BaseService {
  constructor() {
    super(db.User, "User");
  }

  async getAllUsers(page = 1, limit = 10, search = "", filters = {}) {
    const { Op } = require("sequelize");
    const where = {
      role: { [Op.ne]: "root" },
    };

    if (filters.status) {
      if (filters.status === "active") {
        where.isActive = true;
      } else if (filters.status === "pending") {
        where.isActive = false;
        where.verificationToken = { [Op.ne]: null };
      } else if (filters.status === "suspended" || filters.status === "inactive") {
        where.isActive = false;
        where.verificationToken = null;
      }
    }

    if (filters.role && ["customer", "admin"].includes(filters.role)) {
      where.role = filters.role;
    }

    const searchTrimmed = String(search || "").trim();
    if (searchTrimmed) {
      const orClauses = [
        { username: { [Op.like]: `%${searchTrimmed}%` } },
        { email: { [Op.like]: `%${searchTrimmed}%` } },
        { phone: { [Op.like]: `%${searchTrimmed}%` } },
      ];
      if (!isNaN(searchTrimmed) && Number(searchTrimmed) > 0) {
        orClauses.push({ id: Number(searchTrimmed) });
      }
      where[Op.or] = orClauses;
    }

    const options = {
      where,
      searchFields: [],
      attributes: {
        include: [
          [
            db.Sequelize.literal(
              "CASE WHEN isActive = 1 THEN 'active' WHEN verificationToken IS NOT NULL THEN 'pending' ELSE 'suspended' END"
            ),
            "accountStatus",
          ],
        ],
        exclude: ["password", "refreshTokenHash", "resetToken", "verificationToken"],
      },
      order: [["createdAt", "DESC"]],
    };
    return await this.getAll(page, limit, "", options);
  }

  async getUserById(userId) {
    return await this.getById(userId, {
      attributes: { exclude: ["password", "refreshTokenHash", "resetToken", "verificationToken"] }
    });
  }

  async createNewUser(data) {
    try {
      if (!data.email) {
        return { errCode: 1, errMessage: "Email không được để trống" };
      }

      const email = String(data.email).trim().toLowerCase();
      const existEmail = await this.model.findOne({ where: { email } });
      if (existEmail) return { errCode: 1, errMessage: "Email này đã được đăng ký trong hệ thống." };

      const rawUsername = String(data.username || "").trim() || email.split("@")[0];
      if (rawUsername.length < 3) {
        return { errCode: 1, errMessage: "Tên người dùng (username) phải có ít nhất 3 ký tự." };
      }
      if (rawUsername.length > 50) {
        return { errCode: 1, errMessage: "Tên người dùng (username) không được vượt quá 50 ký tự." };
      }

      const existUsername = await this.model.findOne({ where: { username: rawUsername } });
      if (existUsername) {
        return { errCode: 1, errMessage: "Tên người dùng (username) này đã tồn tại. Vui lòng chọn tên khác." };
      }

      const hashedPassword = await hashUserPassword(data.password || "123456");

      // Kiểm tra cấu hình hệ thống: Có bắt buộc xác thực OTP không
      const requireOtp = await SystemSettingService.getSetting("REQUIRE_OTP_VERIFICATION", true);
      
      const isCreatorAdmin = data.creatorRole === "admin" || data.creatorRole === "root";
      const isExplicitActive = isCreatorAdmin && (data.isActive === true || data.isActive === "true" || data.isActive === "1");
      let verificationToken = null;
      let isActive = isExplicitActive;

      if (requireOtp && !isExplicitActive) {
        verificationToken = generateRandomToken();
        isActive = false;
      } else {
        isActive = true;
      }
      
      // SECURITY: Default role is strictly 'customer'. Only admin/root creators can assign higher roles.
      const assignedRole = (isCreatorAdmin && data.role) ? data.role : "customer";

      const userData = {
        email,
        username: rawUsername,
        phone: data.phone ? String(data.phone).trim() : null,
        address: data.address ? String(data.address).trim() : null,
        avatar: data.avatar || null,
        password: hashedPassword,
        role: assignedRole,
        isActive,
        verificationToken: verificationToken ? hashToken(verificationToken) : null,
        verificationTokenExpiresAt: verificationToken ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null,
      };

      const user = await this.model.create(userData);
      
      if (requireOtp && !isActive && verificationToken) {
        sendEmailAsync(sendVerificationEmail, user, verificationToken);
      }

      const { password, refreshTokenHash, resetToken, verificationToken: _, ...safeUser } = user.toJSON();

      return { 
        errCode: 0, 
        data: safeUser,
        requireOtp: Boolean(requireOtp && !isActive),
        errMessage: requireOtp && !isActive 
          ? "Đăng ký thành công! Vui lòng kiểm tra mã OTP trong email."
          : "Đăng ký thành công! Bạn có thể đăng nhập ngay."
      };
    } catch (e) {
      console.error("UserService.createNewUser error:", e);
      if (e.name === "SequelizeValidationError" || e.name === "SequelizeUniqueConstraintError") {
        const firstErr = e.errors && e.errors.length > 0 ? e.errors[0] : null;
        if (firstErr) {
          if (firstErr.path === "username" && (firstErr.type === "unique violation" || firstErr.validatorKey === "not_unique")) {
            return { errCode: 1, errMessage: "Tên người dùng (username) này đã tồn tại trên hệ thống. Vui lòng chọn tên khác." };
          }
          if (firstErr.path === "email" && (firstErr.type === "unique violation" || firstErr.validatorKey === "not_unique")) {
            return { errCode: 1, errMessage: "Email này đã được đăng ký tài khoản." };
          }
          if (firstErr.path === "username" && firstErr.validatorKey === "len") {
            return { errCode: 1, errMessage: "Tên người dùng (username) phải có độ dài từ 3 đến 50 ký tự." };
          }
          return { errCode: 1, errMessage: firstErr.message || "Dữ liệu đăng ký không hợp lệ." };
        }
      }
      return { errCode: 2, errMessage: e.message || "Đã xảy ra lỗi khi tạo người dùng." };
    }
  }


  async updateUser(userId, data, currentUserRole = "customer", currentUserId = null) {
    try {
      const user = await this.model.findByPk(userId);
      if (!user) return { errCode: 1, errMessage: "User not found" };

      if (user.role === "root") {
        return { errCode: 2, errMessage: "Cannot modify root user" };
      }

      const isElevated = currentUserRole === "admin" || currentUserRole === "root";

      // SECURITY: Whitelist updatable fields to prevent Mass Assignment
      const safeUpdateData = {};

      if (data.username !== undefined && data.username !== user.username) {
        const rawUsername = String(data.username).trim();
        if (rawUsername.length >= 3 && rawUsername.length <= 50) {
          const existUsername = await this.model.findOne({ where: { username: rawUsername } });
          if (existUsername && existUsername.id !== user.id) {
            return { errCode: 1, errMessage: "Tên người dùng (username) này đã tồn tại." };
          }
          safeUpdateData.username = rawUsername;
        }
      }

      if (data.email && data.email !== user.email) {
        const exist = await this.model.findOne({ where: { email: data.email } });
        if (exist) return { errCode: 1, errMessage: "Email already exists" };
        safeUpdateData.email = String(data.email).trim().toLowerCase();
      }

      if (data.phone !== undefined) {
        safeUpdateData.phone = data.phone ? String(data.phone).trim() : null;
      }

      if (data.address !== undefined) {
        safeUpdateData.address = data.address ? String(data.address).trim() : null;
      }

      if (data.receiveEmail !== undefined) {
        safeUpdateData.receiveEmail = data.receiveEmail === true || data.receiveEmail === "true" || data.receiveEmail === 1 || data.receiveEmail === "1";
      }

      if (isElevated) {
        if (data.role && ["customer", "admin"].includes(data.role)) {
          // Non-root cannot promote anyone to root
          safeUpdateData.role = data.role;
        }
        if (data.isActive !== undefined) {
          const nextActive = data.isActive === true || data.isActive === "true" || data.isActive === 1 || data.isActive === "1";
          if (!nextActive && currentUserId && String(userId) === String(currentUserId)) {
            return { errCode: 1, errMessage: "Bạn không thể tự vô hiệu hóa tài khoản của chính mình." };
          }
          safeUpdateData.isActive = nextActive;
          if (!nextActive) {
            safeUpdateData.refreshTokenHash = null;
            safeUpdateData.refreshTokenExpiresAt = null;
            try {
              await deleteCache(getRefreshTokenKey(userId));
              await deleteCache(getUserProfileKey(userId));
            } catch (err) {
              console.warn("[UserService.updateUser] Redis eviction warning:", err?.message);
            }
          }
        }
      }

      // If avatar is base64 string, upload to Cloudinary before saving to DB
      if (data.avatar && typeof data.avatar === "string") {
        if (data.avatar.startsWith("data:image")) {
          try {
            const { uploadToCloudinary } = require("../../config/cloudinaryConfig");
            const { validateImageBuffer } = require("../../utils/imageValidator");
            const buffer = Buffer.from(data.avatar.split(",")[1], "base64");
            if (!validateImageBuffer(buffer)) {
              return { errCode: 2, errMessage: "Ảnh đại diện không hợp lệ (magic bytes mismatch)." };
            }
            const uploadRes = await uploadToCloudinary(buffer, "avatars");
            safeUpdateData.avatar = uploadRes.secure_url;
          } catch (uploadErr) {
            console.error("Cloudinary avatar upload error:", uploadErr);
            return { errCode: 2, errMessage: "Lỗi upload ảnh đại diện lên Cloudinary: " + uploadErr.message };
          }
        } else if (data.avatar.startsWith("http://") || data.avatar.startsWith("https://")) {
          safeUpdateData.avatar = data.avatar;
        }
      }

      const updatedUser = await user.update(safeUpdateData);
      const { password, ...userData } = updatedUser.toJSON();
      return { errCode: 0, data: userData };
    } catch (e) {
      console.error("UserService.updateUser error:", e);
      return { errCode: 2, errMessage: e.message };
    }
  }

  async updateUserStatus({ adminId, targetUserId, status, reason = "", req = null }) {
    try {
      if (!adminId || !targetUserId) {
        return { errCode: 1, errMessage: "Thiếu thông tin người thực hiện hoặc người dùng mục tiêu." };
      }

      if (String(adminId) === String(targetUserId)) {
        return { errCode: 1, errMessage: "Bạn không thể tự thay đổi trạng thái của chính mình." };
      }

      const user = await this.model.findByPk(targetUserId);
      if (!user) {
        return { errCode: 1, errMessage: "Người dùng không tồn tại trên hệ thống." };
      }

      if (user.role === "root") {
        return { errCode: 2, errMessage: "Không có quyền thay đổi trạng thái tài khoản cấp cao nhất." };
      }

      const shouldActivate = status === "active";
      const previousState = {
        isActive: user.isActive,
        isPending: !user.isActive && Boolean(user.verificationToken),
        role: user.role,
      };

      // Idempotency: if already in requested state
      if (shouldActivate && user.isActive) {
        return {
          errCode: 0,
          errMessage: "Tài khoản đã ở trạng thái hoạt động.",
          data: { id: user.id, username: user.username, email: user.email, isActive: true, accountStatus: "active" },
        };
      }
      if (!shouldActivate && !user.isActive && !user.verificationToken) {
        return {
          errCode: 0,
          errMessage: "Tài khoản đã ở trạng thái vô hiệu hóa.",
          data: { id: user.id, username: user.username, email: user.email, isActive: false, accountStatus: "suspended" },
        };
      }

      const action = shouldActivate ? "ACCOUNT_ACTIVATED" : "ACCOUNT_DEACTIVATED";
      const defaultReason = shouldActivate
        ? "Quản trị viên kích hoạt tài khoản"
        : "Quản trị viên tạm khóa tài khoản";

      const t = await db.sequelize.transaction();
      try {
        const updatePayload = {
          isActive: shouldActivate,
          verificationToken: null,
          verificationTokenExpiresAt: null,
        };

        if (!shouldActivate) {
          updatePayload.refreshTokenHash = null;
          updatePayload.refreshTokenExpiresAt = null;
        }

        await user.update(updatePayload, { transaction: t });

        if (db.AuditLog) {
          await db.AuditLog.create(
            {
              adminId,
              targetUserId,
              action,
              previousState,
              newState: {
                isActive: shouldActivate,
                isPending: false,
                role: user.role,
              },
              reason: reason?.trim() || defaultReason,
              status: "SUCCESS",
              ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || null,
              userAgent: req?.headers?.["user-agent"] || null,
            },
            { transaction: t }
          );
        }

        await t.commit();
      } catch (dbErr) {
        await t.rollback();
        console.error("UserService.updateUserStatus transaction error:", dbErr);
        if (dbErr.message && dbErr.message.includes("AuditLogs' doesn't exist") && db.AuditLog) {
          await db.AuditLog.sync({ alter: false }).catch(() => {});
        }
        return { errCode: 2, errMessage: "Lỗi cơ sở dữ liệu: " + dbErr.message };
      }

      // Evict Redis caches
      try {
        await deleteCache(getUserProfileKey(targetUserId));
        if (!shouldActivate) {
          await deleteCache(getRefreshTokenKey(targetUserId));
        }
      } catch (cacheErr) {
        console.warn("[UserService] Cache eviction warning:", cacheErr?.message);
      }

      // Isolated in-app notification
      try {
        await NotificationService.createNotification({
          userId: targetUserId,
          title: shouldActivate ? "Tài khoản đã được kích hoạt" : "Tài khoản đã bị tạm khóa",
          message: shouldActivate
            ? "Tài khoản của bạn đã được quản trị viên kích hoạt. Bạn hiện có thể đăng nhập và sử dụng dịch vụ bình thường."
            : `Tài khoản của bạn đã bị quản trị viên tạm khóa.${reason ? ` Lý do: ${reason}` : ""}`,
          type: "system",
        });
      } catch (notifErr) {
        console.warn("[UserService] Notification dispatch warning:", notifErr?.message);
      }

      return {
        errCode: 0,
        errMessage: shouldActivate ? "Kích hoạt tài khoản thành công!" : "Vô hiệu hóa tài khoản thành công!",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          isActive: shouldActivate,
          accountStatus: shouldActivate ? "active" : "suspended",
        },
      };
    } catch (e) {
      console.error("UserService.updateUserStatus error:", e);
      return { errCode: 2, errMessage: e.message || "Đã xảy ra lỗi khi cập nhật trạng thái tài khoản." };
    }
  }

  async bulkUpdateUserStatus({ adminId, userIds, status, reason = "", req = null }) {
    try {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return { errCode: 1, errMessage: "Danh sách tài khoản không được để trống." };
      }
      if (userIds.length > 50) {
        return { errCode: 1, errMessage: "Tối đa chỉ xử lý 50 tài khoản mỗi lần." };
      }

      const results = [];
      let successCount = 0;
      let failureCount = 0;

      for (const rawId of userIds) {
        const targetUserId = Number(rawId);
        if (isNaN(targetUserId)) {
          results.push({ id: rawId, success: false, message: "ID không hợp lệ." });
          failureCount++;
          continue;
        }

        if (String(adminId) === String(targetUserId)) {
          results.push({ id: targetUserId, success: false, message: "Không thể tự thao tác trên chính mình." });
          failureCount++;
          continue;
        }

        const res = await this.updateUserStatus({
          adminId,
          targetUserId,
          status,
          reason,
          req,
        });

        if (res.errCode === 0) {
          results.push({ id: targetUserId, success: true, message: res.errMessage });
          successCount++;
        } else {
          results.push({ id: targetUserId, success: false, message: res.errMessage });
          failureCount++;
        }
      }

      return {
        errCode: 0,
        errMessage: `Đã xử lý xong: ${successCount} thành công, ${failureCount} thất bại.`,
        data: {
          total: userIds.length,
          successCount,
          failureCount,
          results,
        },
      };
    } catch (e) {
      console.error("UserService.bulkUpdateUserStatus error:", e);
      return { errCode: 2, errMessage: e.message || "Lỗi thao tác hàng loạt." };
    }
  }

  async getUserMetrics() {
    const { Op } = require("sequelize");
    try {
      const [totalUsers, activeUsers, pendingUsers, suspendedUsers, adminUsers, customerUsers] = await Promise.all([
        this.model.count({ where: { role: { [Op.ne]: "root" } } }),
        this.model.count({ where: { isActive: true, role: { [Op.ne]: "root" } } }),
        this.model.count({ where: { isActive: false, verificationToken: { [Op.ne]: null }, role: { [Op.ne]: "root" } } }),
        this.model.count({ where: { isActive: false, verificationToken: null, role: { [Op.ne]: "root" } } }),
        this.model.count({ where: { role: "admin" } }),
        this.model.count({ where: { role: "customer" } }),
      ]);

      return {
        errCode: 0,
        data: {
          totalUsers,
          activeUsers,
          pendingUsers,
          suspendedUsers,
          adminUsers,
          customerUsers,
        },
      };
    } catch (e) {
      console.error("UserService.getUserMetrics error:", e);
      return { errCode: 2, errMessage: "Lỗi tải thống kê người dùng: " + e.message };
    }
  }

  async getUserAuditLogs(page = 1, limit = 10, targetUserId = null, action = null) {
    try {
      if (!db.AuditLog) {
        return { errCode: 0, data: [], pagination: { totalItems: 0, currentPage: 1, totalPages: 1, limit } };
      }

      const p = Math.max(1, +page || 1);
      const l = Math.min(100, Math.max(1, +limit || 10));
      const offset = (p - 1) * l;

      const where = {};
      if (targetUserId) {
        where.targetUserId = Number(targetUserId);
      }
      if (action) {
        where.action = action;
      }

      const { count, rows } = await db.AuditLog.findAndCountAll({
        where,
        limit: l,
        offset,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: db.User,
            as: "admin",
            attributes: ["id", "username", "email", "avatar"],
          },
          {
            model: db.User,
            as: "targetUser",
            attributes: ["id", "username", "email", "avatar"],
          },
        ],
      });

      return {
        errCode: 0,
        data: rows,
        pagination: {
          totalItems: count,
          currentPage: p,
          totalPages: Math.ceil(count / l) || 1,
          limit: l,
        },
      };
    } catch (e) {
      console.error("UserService.getUserAuditLogs error:", e);
      if (e.message && e.message.includes("AuditLogs' doesn't exist")) {
        if (db.AuditLog) {
          await db.AuditLog.sync({ alter: false }).catch(() => {});
        }
        return {
          errCode: 0,
          data: [],
          pagination: { totalItems: 0, currentPage: 1, totalPages: 1, limit: +limit || 10 },
        };
      }
      return { errCode: 2, errMessage: "Lỗi tải nhật ký quản trị: " + e.message };
    }
  }

  async deleteUser(userId, currentUserId = null) {
    try {
      if (currentUserId && String(userId) === String(currentUserId)) {
        return { errCode: 4, errMessage: "Bạn không thể tự xóa chính mình." };
      }

      const user = await this.model.findByPk(userId);
      if (!user) return { errCode: 1, errMessage: "User not found" };

      if (user.role === "root") {
        return { errCode: 2, errMessage: "Cannot delete root user" };
      }

      // Check if user has orders - If they do, we MUST NOT delete due to financial records
      const orderCount = await db.Order.count({ where: { userId } });
      if (orderCount > 0) {
        // Soft delete/Deactivate
        user.isActive = false;
        await user.save();
        return {
          errCode: 0,
          errMessage: "Người dùng đã có lịch sử mua hàng. Hệ thống đã chuyển trạng thái thành Ngưng hoạt động để bảo toàn dữ liệu đơn hàng.",
        };
      }

      // If no orders, we can try to hard delete
      // Sequelize CASCADE (defined in models) will handle Notifications, Wishlist, etc.
      await user.destroy();
      return { errCode: 0, errMessage: "Người dùng đã được xóa hoàn toàn khỏi hệ thống." };
    } catch (e) {
      console.error("UserService.deleteUser error:", e);
      return { errCode: 3, errMessage: "Lỗi hệ thống: " + e.message };
    }
  }
}

module.exports = new UserService();
