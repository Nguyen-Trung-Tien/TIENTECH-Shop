const db = require("../../models");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../jwtService");
const { sendForgotPasswordEmail, sendVerificationEmail } = require("../sendEmail");
const { 
  hashToken, 
  generateRandomToken, 
  getTokenExpiryDate, 
  hashUserPassword 
} = require("./AuthHelper");

class AuthService {
  async login(email, password) {
    try {
      const user = await db.User.findOne({ where: { email } });
      if (!user) return { errCode: 1, errMessage: "Không tìm thấy người dùng!" };
      if (!user.isActive) return { errCode: 3, errMessage: "Tài khoản chưa được kích hoạt!" };

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return { errCode: 2, errMessage: "Mật khẩu không chính xác!" };

      const payload = { id: user.id, email: user.email, role: user.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      await user.update({
        refreshTokenHash: hashToken(refreshToken),
        refreshTokenExpiresAt: getTokenExpiryDate(refreshToken),
      });

      const { password: _, ...userData } = user.toJSON();
      return { errCode: 0, data: { user: userData, accessToken, refreshToken } };
    } catch (error) {
      console.error("AuthService.login error:", error);
      return { errCode: -1, errMessage: error.message };
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) return { errCode: 1, errMessage: "Refresh token không hợp lệ" };

      const user = await db.User.findByPk(decoded.id);
      if (!user || !user.refreshTokenHash) return { errCode: 2, errMessage: "Refresh token đã bị thu hồi" };

      if (user.refreshTokenHash !== hashToken(refreshToken)) return { errCode: 3, errMessage: "Refresh token không khớp" };

      if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) return { errCode: 4, errMessage: "Refresh token đã hết hạn" };

      const payload = { id: user.id, email: user.email, role: user.role };
      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);

      await user.update({
        refreshTokenHash: hashToken(newRefreshToken),
        refreshTokenExpiresAt: getTokenExpiryDate(newRefreshToken),
      });

      return { errCode: 0, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } };
    } catch (error) {
      console.error("AuthService.refreshToken error:", error);
      return { errCode: -1, errMessage: error.message };
    }
  }

  async logout(userId) {
    try {
      const user = await db.User.findByPk(userId);
      if (user) await user.update({ refreshTokenHash: null, refreshTokenExpiresAt: null });
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

      await sendForgotPasswordEmail(user, resetToken);
      return { errCode: 0, errMessage: "Gửi email thành công!" };
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
      const user = await db.User.findOne({ where: { email } });
      if (!user || user.resetToken !== hashToken(token)) return { errCode: 1, errMessage: "Token không hợp lệ" };
      
      user.password = await hashUserPassword(newPassword);
      user.resetToken = null;
      user.resetTokenExpiresAt = null;
      await user.save();
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
      await sendVerificationEmail(user, token);
      return { errCode: 0, errMessage: "Đã gửi lại email" };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }

  async updatePassword(userId, oldPassword, newPassword) {
    try {
      const user = await db.User.findByPk(userId);
      if (!user) return { errCode: 1, errMessage: "User not found" };

      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid) return { errCode: 2, errMessage: "Mật khẩu cũ sai" };

      user.password = await hashUserPassword(newPassword);
      await user.save();
      return { errCode: 0, errMessage: "Đổi mật khẩu thành công" };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }
}

module.exports = new AuthService();
