const db = require("../../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../utils/jwtHelper");
const { sendForgotPasswordEmail, sendVerificationEmail, sendEmailAsync } = require("../common/EmailService");
const { getCache, setCache, deleteCache } = require("../../config/redis");
const { 
  hashToken, 
  generateRandomToken, 
  getTokenExpiryDate, 
  hashUserPassword,
  validatePasswordStrength,
  performDummyBcryptCompare,
  getUserProfileKey,
  getRefreshTokenKey,
  getTokenBlacklistKey,
} = require("./AuthHelper");

class AuthService {
  async login(email, password) {
    try {
      const user = await db.User.findOne({ where: { email } });
      if (!user) {
        await performDummyBcryptCompare(password);
        return { errCode: 2, errMessage: "Email hoặc mật khẩu không chính xác!", statusCode: 401 };
      }
      if (!user.isActive) {
        return { errCode: 3, errMessage: "Tài khoản chưa được kích hoạt!", statusCode: 401 };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return { errCode: 2, errMessage: "Email hoặc mật khẩu không chính xác!", statusCode: 401 };
      }

      const payload = { id: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      const refreshTokenHash = hashToken(refreshToken);
      const refreshTokenExpiresAt = getTokenExpiryDate(refreshToken);

      await user.update({
        refreshTokenHash,
        refreshTokenExpiresAt,
      });

      const { password: _, ...userData } = user.toJSON();

      // Cache User Profile & Refresh Token State in Redis
      await setCache(getUserProfileKey(user.id), userData, 900); // 15 mins TTL
      await setCache(
        getRefreshTokenKey(user.id),
        { hash: refreshTokenHash, expiresAt: refreshTokenExpiresAt, email: user.email, role: user.role },
        7 * 24 * 3600
      );

      return { errCode: 0, data: { user: userData, accessToken, refreshToken } };
    } catch (error) {
      console.error("AuthService.login error:", error);
      return { errCode: -1, errMessage: error.message };
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) return { errCode: 1, errMessage: "Refresh token không hợp lệ", statusCode: 401 };

      const providedTokenHash = hashToken(refreshToken);
      const redisKey = getRefreshTokenKey(decoded.id);
      
      // Try Redis Cache First
      let cachedSession = await getCache(redisKey);
      let userRole = decoded.role;
      let userEmail = decoded.email;

      if (cachedSession) {
        if (cachedSession.hash !== providedTokenHash) {
          return { errCode: 3, errMessage: "Refresh token không khớp", statusCode: 401 };
        }
        if (cachedSession.expiresAt && new Date(cachedSession.expiresAt) < new Date()) {
          return { errCode: 4, errMessage: "Refresh token đã hết hạn", statusCode: 401 };
        }
        userRole = cachedSession.role || decoded.role;
        userEmail = cachedSession.email || decoded.email;
      } else {
        // Fallback to MySQL DB with Projection (only necessary attributes)
        const user = await db.User.findByPk(decoded.id, {
          attributes: ["id", "email", "role", "isActive", "refreshTokenHash", "refreshTokenExpiresAt"],
        });

        if (!user || !user.isActive || !user.refreshTokenHash) {
          return { errCode: 2, errMessage: "Refresh token đã bị thu hồi hoặc tài khoản chưa kích hoạt", statusCode: 401 };
        }
        if (user.refreshTokenHash !== providedTokenHash) {
          return { errCode: 3, errMessage: "Refresh token không khớp", statusCode: 401 };
        }
        if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
          return { errCode: 4, errMessage: "Refresh token đã hết hạn", statusCode: 401 };
        }
        userRole = user.role;
        userEmail = user.email;
      }

      // Generate New Tokens (Rotation)
      const payload = { id: decoded.id, email: userEmail, role: userRole };
      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      const newHash = hashToken(newRefreshToken);
      const newExpiresAt = getTokenExpiryDate(newRefreshToken);

      // Async update DB & Redis
      await db.User.update(
        { refreshTokenHash: newHash, refreshTokenExpiresAt: newExpiresAt },
        { where: { id: decoded.id } }
      );
      await setCache(
        redisKey,
        { hash: newHash, expiresAt: newExpiresAt, email: userEmail, role: userRole },
        7 * 24 * 3600
      );

      return { errCode: 0, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } };
    } catch (error) {
      console.error("AuthService.refreshToken error:", error);
      return { errCode: -1, errMessage: error.message };
    }
  }

  async logout(userId, currentAccessToken = null) {
    try {
      if (userId) {
        // Update DB
        const user = await db.User.findByPk(userId);
        if (user) await user.update({ refreshTokenHash: null, refreshTokenExpiresAt: null });

        // Clear Redis Caches
        await deleteCache(getUserProfileKey(userId));
        await deleteCache(getRefreshTokenKey(userId));
      }

      // Blacklist current access token in Redis if provided
      if (currentAccessToken) {
        const decoded = jwt.decode(currentAccessToken);
        const ttl = decoded?.exp
          ? Math.max(1, decoded.exp - Math.floor(Date.now() / 1000))
          : 900;
        await setCache(getTokenBlacklistKey(currentAccessToken), true, ttl);
      }

      return { errCode: 0 };
    } catch (error) {
      console.error("AuthService.logout error:", error);
      return { errCode: -1, errMessage: error.message };
    }
  }

  async forgotPassword(email) {
    try {
      const user = await db.User.findOne({ where: { email } });
      if (!user) return { errCode: 1, errMessage: "Email không tồn tại" };

      const resetToken = uuidv4();
      user.resetToken = hashToken(resetToken);
      user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      sendEmailAsync(sendForgotPasswordEmail, user, resetToken);
      return { errCode: 0, errMessage: "Mã xác nhận đã được gửi đến email của bạn!" };
    } catch (error) {
      console.error("AuthService.forgotPassword error:", error);
      return { errCode: -1, errMessage: error.message };
    }
  }

  async verifyResetToken(email, token) {
    try {
      const user = await db.User.findOne({ where: { email } });
      if (!user || user.resetToken !== hashToken(token)) return { errCode: 1, errMessage: "Token không hợp lệ" };
      if (user.resetTokenExpiresAt < new Date()) return { errCode: 2, errMessage: "Token đã hết hạn" };
      return { errCode: 0 };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }

  async resetPassword(email, token, newPassword) {
    try {
      const passCheck = validatePasswordStrength(newPassword);
      if (!passCheck.valid) return { errCode: 4, errMessage: passCheck.message };

      const user = await db.User.findOne({ where: { email } });
      if (!user || user.resetToken !== hashToken(token)) return { errCode: 1, errMessage: "Token không hợp lệ" };
      
      user.password = await hashUserPassword(newPassword);
      user.resetToken = null;
      user.resetTokenExpiresAt = null;
      await user.save();

      await deleteCache(getUserProfileKey(user.id));
      await deleteCache(getRefreshTokenKey(user.id));

      return { errCode: 0, errMessage: "Đổi mật khẩu thành công!" };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }

  async verifyEmail(email, token) {
    try {
      const user = await db.User.findOne({ where: { email } });
      if (!user) return { errCode: 1, errMessage: "Không tìm thấy người dùng!" };
      if (user.isActive) return { errCode: 0, errMessage: "Tài khoản đã kích hoạt" };

      if (user.verificationToken !== hashToken(token)) return { errCode: 2, errMessage: "Mã xác nhận sai" };
      if (user.verificationTokenExpiresAt < new Date()) return { errCode: 3, errMessage: "Mã đã hết hạn" };

      user.isActive = true;
      user.verificationToken = null;
      user.verificationTokenExpiresAt = null;
      await user.save();
      return { errCode: 0, errMessage: "Xác nhận thành công!" };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }

  async resendVerificationEmail(email) {
    try {
      const user = await db.User.findOne({ where: { email } });
      if (!user || user.isActive) return { errCode: 1, errMessage: "Không hợp lệ" };

      const token = generateRandomToken();
      user.verificationToken = hashToken(token);
      user.verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();

      // Non-blocking async email execution
      sendEmailAsync(sendVerificationEmail, user, token);
      return { errCode: 0, errMessage: "Đã gửi lại email" };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }

  async updatePassword(userId, oldPassword, newPassword) {
    try {
      const passCheck = validatePasswordStrength(newPassword);
      if (!passCheck.valid) return { errCode: 4, errMessage: passCheck.message };

      const user = await db.User.findByPk(userId);
      if (!user) return { errCode: 1, errMessage: "User not found" };

      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid) return { errCode: 2, errMessage: "Mật khẩu cũ không chính xác!" };

      user.password = await hashUserPassword(newPassword);
      await user.save();

      await deleteCache(getUserProfileKey(userId));
      await deleteCache(getRefreshTokenKey(userId));

      return { errCode: 0, errMessage: "Đổi mật khẩu thành công!" };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }
}

module.exports = new AuthService();

