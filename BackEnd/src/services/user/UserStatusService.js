const db = require("../../models");
const NotificationService = require("../notification/NotificationService");
const { deleteCache, setCache } = require("../../config/redis");
const {
  getUserProfileKey,
  getRefreshTokenKey,
  getUserStatusKey,
} = require("./AuthHelper");

class UserStatusService {
  async updateUserStatus({
    adminId,
    targetUserId,
    status,
    reason = "",
    req = null,
  }) {
    try {
      if (!adminId || !targetUserId) {
        return {
          errCode: 1,
          errMessage:
            "Thiếu thông tin người thực hiện hoặc người dùng mục tiêu.",
        };
      }

      if (String(adminId) === String(targetUserId)) {
        return {
          errCode: 1,
          errMessage: "Bạn không thể tự thay đổi trạng thái của chính mình.",
        };
      }

      const user = await db.User.findByPk(targetUserId);
      if (!user) {
        return {
          errCode: 1,
          errMessage: "Người dùng không tồn tại trên hệ thống.",
        };
      }

      if (user.role === "root") {
        return {
          errCode: 2,
          errMessage:
            "Không có quyền thay đổi trạng thái tài khoản cấp cao nhất.",
        };
      }

      const shouldActivate = status === "active";
      const previousState = {
        isActive: user.isActive,
        isPending: !user.isActive && Boolean(user.verificationToken),
        role: user.role,
      };

      if (shouldActivate && user.isActive) {
        return {
          errCode: 0,
          errMessage: "Tài khoản đã ở trạng thái hoạt động.",
          data: {
            id: user.id,
            username: user.username,
            email: user.email,
            isActive: true,
            accountStatus: "active",
          },
        };
      }
      if (!shouldActivate && !user.isActive && !user.verificationToken) {
        return {
          errCode: 0,
          errMessage: "Tài khoản đã ở trạng thái vô hiệu hóa.",
          data: {
            id: user.id,
            username: user.username,
            email: user.email,
            isActive: false,
            accountStatus: "suspended",
          },
        };
      }

      const action = shouldActivate
        ? "ACCOUNT_ACTIVATED"
        : "ACCOUNT_DEACTIVATED";
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
          updatePayload.tokenVersion = (user.tokenVersion || 0) + 1;
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
            { transaction: t },
          );
        }

        await t.commit();
      } catch (dbErr) {
        await t.rollback();
        console.error("UserStatusService.updateUserStatus transaction error:", dbErr);
        if (
          dbErr.message &&
          dbErr.message.includes("AuditLogs' doesn't exist") &&
          db.AuditLog
        ) {
          await db.AuditLog.sync({ alter: false }).catch(() => {});
        }
        return {
          errCode: 2,
          errMessage: "Lỗi cơ sở dữ liệu: " + dbErr.message,
        };
      }

      try {
        await setCache(
          getUserStatusKey(targetUserId),
          {
            isActive: shouldActivate,
            role: user.role,
            tokenVersion: typeof user.tokenVersion === "number" ? user.tokenVersion : 0,
          },
          86400,
        );
        await deleteCache(getUserProfileKey(targetUserId));
        if (!shouldActivate) {
          await deleteCache(getRefreshTokenKey(targetUserId));
        }
      } catch (cacheErr) {
        console.warn("[UserStatusService] Cache eviction warning:", cacheErr?.message);
      }

      try {
        const io = req?.app?.get?.("io");
        if (io) {
          if (!shouldActivate) {
            io.to(`user_${targetUserId}`).emit("account_locked", {
              userId: targetUserId,
              reason:
                reason?.trim() || "Tài khoản của bạn đã bị quản trị viên khóa.",
              lockedAt: new Date().toISOString(),
            });
          } else {
            io.to(`user_${targetUserId}`).emit("account_unlocked", {
              userId: targetUserId,
              unlockedAt: new Date().toISOString(),
            });
          }
        }
      } catch (socketErr) {
        console.warn("[UserStatusService] Socket dispatch warning:", socketErr?.message);
      }

      try {
        await NotificationService.createNotification({
          userId: targetUserId,
          title: shouldActivate
            ? "Tài khoản đã được kích hoạt"
            : "Tài khoản đã bị tạm khóa",
          message: shouldActivate
            ? "Tài khoản của bạn đã được quản trị viên kích hoạt. Bạn hiện có thể đăng nhập và sử dụng dịch vụ bình thường."
            : `Tài khoản của bạn đã bị quản trị viên tạm khóa.${reason ? ` Lý do: ${reason}` : ""}`,
          type: "system",
        });
      } catch (notifErr) {
        console.warn("[UserStatusService] Notification dispatch warning:", notifErr?.message);
      }

      return {
        errCode: 0,
        errMessage: shouldActivate
          ? "Kích hoạt tài khoản thành công!"
          : "Vô hiệu hóa tài khoản thành công!",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          isActive: shouldActivate,
          accountStatus: shouldActivate ? "active" : "suspended",
        },
      };
    } catch (e) {
      console.error("UserStatusService.updateUserStatus error:", e);
      return {
        errCode: 2,
        errMessage:
          e.message || "Đã xảy ra lỗi khi cập nhật trạng thái tài khoản.",
      };
    }
  }

  async bulkUpdateUserStatus({
    adminId,
    userIds,
    status,
    reason = "",
    req = null,
  }) {
    try {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return {
          errCode: 1,
          errMessage: "Danh sách tài khoản không được để trống.",
        };
      }
      if (userIds.length > 50) {
        return {
          errCode: 1,
          errMessage: "Tối đa chỉ xử lý 50 tài khoản mỗi lần.",
        };
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
          results.push({
            id: targetUserId,
            success: false,
            message: "Không thể tự thao tác trên chính mình.",
          });
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
      console.error("UserStatusService.bulkUpdateUserStatus error:", e);
      return { errCode: 2, errMessage: e.message || "Lỗi thao tác hàng loạt." };
    }
  }
}

module.exports = new UserStatusService();
