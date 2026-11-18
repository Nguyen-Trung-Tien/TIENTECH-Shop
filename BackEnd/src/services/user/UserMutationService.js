const db = require("../../models");
const {
  sendVerificationEmail,
  sendEmailAsync,
} = require("../common/EmailService");
const SystemSettingService = require("../system/SystemSettingService");
const { deleteCache } = require("../../config/redis");
const {
  hashToken,
  generateRandomToken,
  hashUserPassword,
  validatePasswordStrength,
  getUserProfileKey,
  getRefreshTokenKey,
  getUserStatusKey,
} = require("./AuthHelper");

const evictUserCaches = async (userId, context) => {
  try {
    await Promise.all([
      deleteCache(getRefreshTokenKey(userId)),
      deleteCache(getUserProfileKey(userId)),
      deleteCache(getUserStatusKey(userId)),
    ]);
  } catch (err) {
    console.warn(`[${context}] Redis eviction warning:`, err?.message);
  }
};

class UserMutationService {
  async createNewUser(data) {
    try {
      if (!data.email) {
        return { errCode: 1, errMessage: "Email không được để trống" };
      }

      const email = String(data.email).trim().toLowerCase();
      const existEmail = await db.User.findOne({ where: { email } });
      if (existEmail) {
        return {
          errCode: 1,
          errMessage: "Email này đã được đăng ký trong hệ thống.",
        };
      }

      const rawUsername =
        String(data.username || "").trim() || email.split("@")[0];
      if (rawUsername.length < 3) {
        return {
          errCode: 1,
          errMessage: "Tên người dùng (username) phải có ít nhất 3 ký tự.",
        };
      }
      if (rawUsername.length > 50) {
        return {
          errCode: 1,
          errMessage: "Tên người dùng (username) không được vượt quá 50 ký tự.",
        };
      }

      const existUsername = await db.User.findOne({
        where: { username: rawUsername },
      });
      if (existUsername) {
        return {
          errCode: 1,
          errMessage:
            "Tên người dùng (username) này đã tồn tại. Vui lòng chọn tên khác.",
        };
      }

      const passCheck = validatePasswordStrength(data.password);
      if (!passCheck.valid) {
        return { errCode: 1, errMessage: passCheck.message };
      }
      const hashedPassword = await hashUserPassword(data.password);

      const requireOtp = await SystemSettingService.getSetting(
        "REQUIRE_OTP_VERIFICATION",
        true,
      );

      const isCreatorAdmin =
        data.creatorRole === "admin" || data.creatorRole === "root";
      const isExplicitActive =
        isCreatorAdmin &&
        (data.isActive === true ||
          data.isActive === "true" ||
          data.isActive === "1");
      let verificationToken = null;
      let isActive = isExplicitActive;

      if (requireOtp && !isExplicitActive) {
        verificationToken = generateRandomToken();
        isActive = false;
      } else {
        isActive = true;
      }

      const assignedRole = isCreatorAdmin && data.role ? data.role : "customer";

      const userData = {
        email,
        username: rawUsername,
        phone: data.phone ? String(data.phone).trim() : null,
        address: data.address ? String(data.address).trim() : null,
        avatar: data.avatar || null,
        password: hashedPassword,
        role: assignedRole,
        isActive,
        verificationToken: verificationToken
          ? hashToken(verificationToken)
          : null,
        verificationTokenExpiresAt: verificationToken
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null,
      };

      const user = await db.User.create(userData);

      if (requireOtp && !isActive && verificationToken) {
        sendEmailAsync(sendVerificationEmail, user, verificationToken);
      }

      const {
        password: _pw,
        refreshTokenHash: _rth,
        resetToken: _rt,
        verificationToken: _vt,
        ...safeUser
      } = user.toJSON();

      return {
        errCode: 0,
        data: safeUser,
        requireOtp: Boolean(requireOtp && !isActive),
        errMessage:
          requireOtp && !isActive
            ? "Đăng ký thành công! Vui lòng kiểm tra mã OTP trong email."
            : "Đăng ký thành công! Bạn có thể đăng nhập ngay.",
      };
    } catch (e) {
      console.error("UserMutationService.createNewUser error:", e);
      if (
        e.name === "SequelizeValidationError" ||
        e.name === "SequelizeUniqueConstraintError"
      ) {
        const firstErr = e.errors && e.errors.length > 0 ? e.errors[0] : null;
        if (firstErr) {
          if (
            firstErr.path === "username" &&
            (firstErr.type === "unique violation" ||
              firstErr.validatorKey === "not_unique")
          ) {
            return {
              errCode: 1,
              errMessage:
                "Tên người dùng (username) này đã tồn tại trên hệ thống. Vui lòng chọn tên khác.",
            };
          }
          if (
            firstErr.path === "email" &&
            (firstErr.type === "unique violation" ||
              firstErr.validatorKey === "not_unique")
          ) {
            return {
              errCode: 1,
              errMessage: "Email này đã được đăng ký tài khoản.",
            };
          }
          if (firstErr.path === "username" && firstErr.validatorKey === "len") {
            return {
              errCode: 1,
              errMessage:
                "Tên người dùng (username) phải có độ dài từ 3 đến 50 ký tự.",
            };
          }
          return {
            errCode: 1,
            errMessage: firstErr.message || "Dữ liệu đăng ký không hợp lệ.",
          };
        }
      }
      return {
        errCode: 2,
        errMessage: e.message || "Đã xảy ra lỗi khi tạo người dùng.",
      };
    }
  }

  async updateUser(
    userId,
    data,
    currentUserRole = "customer",
    currentUserId = null,
  ) {
    try {
      const user = await db.User.findByPk(userId);
      if (!user) return { errCode: 1, errMessage: "User not found" };
      if (user.role === "root") {
        return { errCode: 2, errMessage: "Cannot modify root user" };
      }

      const isElevated =
        currentUserRole === "admin" || currentUserRole === "root";
      const safeUpdateData = {};

      if (data.username !== undefined && data.username !== user.username) {
        const rawUsername = String(data.username).trim();
        if (rawUsername.length >= 3 && rawUsername.length <= 50) {
          const existUsername = await db.User.findOne({
            where: { username: rawUsername },
          });
          if (existUsername && existUsername.id !== user.id) {
            return {
              errCode: 1,
              errMessage: "Tên người dùng (username) này đã tồn tại.",
            };
          }
          safeUpdateData.username = rawUsername;
        }
      }

      if (data.email && data.email !== user.email) {
        const exist = await db.User.findOne({
          where: { email: data.email },
        });
        if (exist) return { errCode: 1, errMessage: "Email already exists" };
        safeUpdateData.email = String(data.email).trim().toLowerCase();
      }

      if (data.phone !== undefined) {
        safeUpdateData.phone = data.phone ? String(data.phone).trim() : null;
      }

      if (data.address !== undefined) {
        safeUpdateData.address = data.address
          ? String(data.address).trim()
          : null;
      }

      if (data.receiveEmail !== undefined) {
        safeUpdateData.receiveEmail =
          data.receiveEmail === true ||
          data.receiveEmail === "true" ||
          data.receiveEmail === 1 ||
          data.receiveEmail === "1";
      }

      if (isElevated) {
        if (data.role && ["customer", "admin"].includes(data.role)) {
          safeUpdateData.role = data.role;
        }
        if (data.isActive !== undefined) {
          const nextActive =
            data.isActive === true ||
            data.isActive === "true" ||
            data.isActive === 1 ||
            data.isActive === "1";
          if (
            !nextActive &&
            currentUserId &&
            String(userId) === String(currentUserId)
          ) {
            return {
              errCode: 1,
              errMessage:
                "Bạn không thể tự vô hiệu hóa tài khoản của chính mình.",
            };
          }
          safeUpdateData.isActive = nextActive;
          if (!nextActive) {
            safeUpdateData.refreshTokenHash = null;
            safeUpdateData.refreshTokenExpiresAt = null;
            await evictUserCaches(userId, "UserMutationService.updateUser");
          }
        }
      }

      if (data.avatar && typeof data.avatar === "string") {
        if (data.avatar.startsWith("data:image")) {
          try {
            const { uploadToCloudinary } = require("../../config/cloudinaryConfig");
            const { validateImageBuffer } = require("../../utils/imageValidator");
            const buffer = Buffer.from(data.avatar.split(",")[1], "base64");
            if (!validateImageBuffer(buffer)) {
              return {
                errCode: 2,
                errMessage: "Ảnh đại diện không hợp lệ (magic bytes mismatch).",
              };
            }
            const uploadRes = await uploadToCloudinary(buffer, "avatars");
            safeUpdateData.avatar = uploadRes.secure_url;
          } catch (uploadErr) {
            console.error("Cloudinary avatar upload error:", uploadErr);
            return {
              errCode: 2,
              errMessage:
                "Lỗi upload ảnh đại diện lên Cloudinary: " + uploadErr.message,
            };
          }
        } else if (
          data.avatar.startsWith("http://") ||
          data.avatar.startsWith("https://")
        ) {
          safeUpdateData.avatar = data.avatar;
        }
      }

      const updatedUser = await user.update(safeUpdateData);
      await evictUserCaches(userId, "UserMutationService.updateUser");
      const {
        password: _pw,
        refreshTokenHash: _rth,
        resetToken: _rt,
        verificationToken: _vt,
        ...userData
      } = updatedUser.toJSON();
      return { errCode: 0, data: userData };
    } catch (e) {
      console.error("UserMutationService.updateUser error:", e);
      return { errCode: 2, errMessage: e.message };
    }
  }

  async deleteUser(userId, currentUserId = null) {
    try {
      if (currentUserId && String(userId) === String(currentUserId)) {
        return { errCode: 4, errMessage: "Bạn không thể tự xóa chính mình." };
      }

      const user = await db.User.findByPk(userId);
      if (!user) return { errCode: 1, errMessage: "User not found" };
      if (user.role === "root") {
        return { errCode: 2, errMessage: "Cannot delete root user" };
      }

      const orderCount = await db.Order.count({ where: { userId } });
      if (orderCount > 0) {
        user.isActive = false;
        user.refreshTokenHash = null;
        user.refreshTokenExpiresAt = null;
        await user.save();
        await evictUserCaches(userId, "UserMutationService.deleteUser");
        return {
          errCode: 0,
          errMessage:
            "Người dùng đã có lịch sử mua hàng. Hệ thống đã chuyển trạng thái thành Ngưng hoạt động để bảo toàn dữ liệu đơn hàng.",
        };
      }

      await user.destroy();
      await evictUserCaches(userId, "UserMutationService.deleteUser");
      return {
        errCode: 0,
        errMessage: "Người dùng đã được xóa hoàn toàn khỏi hệ thống.",
      };
    } catch (e) {
      console.error("UserMutationService.deleteUser error:", e);
      return { errCode: 3, errMessage: "Lỗi hệ thống: " + e.message };
    }
  }
}

module.exports = new UserMutationService();
