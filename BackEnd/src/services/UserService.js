const db = require("../models");
const BaseService = require("./BaseService");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../services/jwtService");
const { sendForgotPasswordEmail, sendVerificationEmail } = require("./sendEmail");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateRandomToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};

const getTokenExpiryDate = (token) => {
  const decoded = jwt.decode(token);
  if (!decoded?.exp) return null;
  return new Date(decoded.exp * 1000);
};

const hashUserPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

class UserService extends BaseService {
  constructor() {
    super(db.User, "User");
  }

  async getAllUsers(page = 1, limit = 10, search = "") {
    const { Op } = require("sequelize");
    const options = {
      searchFields: ["username", "email", "phone"],
      where: {
        role: { [Op.ne]: "root" }
      },
      attributes: { exclude: ["password", "refreshTokenHash", "resetToken", "verificationToken"] },
      order: [["createdAt", "DESC"]]
    };
    return await this.getAll(page, limit, search, options);
  }

  async getUserById(userId) {
    return await this.getById(userId, {
      attributes: { exclude: ["password", "refreshTokenHash", "resetToken", "verificationToken"] }
    });
  }

  async createNewUser(data) {
    try {
      const exist = await this.model.findOne({ where: { email: data.email } });
      if (exist) return { errCode: 1, errMessage: "Email đã tồn tại" };

      const hashedPassword = await hashUserPassword(data.password || "123456");
      const verificationToken = generateRandomToken();
      
      const userData = {
        ...data,
        password: hashedPassword,
        role: data.role || "customer",
        isActive: data.isActive ?? false,
        verificationToken: hashToken(verificationToken),
        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const user = await this.model.create(userData);
      
      if (!data.isActive) {
        await sendVerificationEmail(user, verificationToken);
      }

      return { errCode: 0, data: user };
    } catch (e) {
      console.error("UserService.createNewUser error:", e);
      return { errCode: 2, errMessage: e.message };
    }
  }

  async updateUser(userId, data, currentUserRole = "customer") {
    try {
      const user = await this.model.findByPk(userId);
      if (!user) return { errCode: 1, errMessage: "User not found" };

      if (data.email && data.email !== user.email) {
        const exist = await this.model.findOne({ where: { email: data.email } });
        if (exist) return { errCode: 1, errMessage: "Email already exists" };
      }

      if (data.role && currentUserRole !== "admin") {
        delete data.role;
      }

      const updatedUser = await user.update(data);
      const { password, ...userData } = updatedUser.toJSON();
      return { errCode: 0, data: userData };
    } catch (e) {
      console.error("UserService.updateUser error:", e);
      return { errCode: 2, errMessage: e.message };
    }
  }

  async handleUserLogin(email, password) {
    try {
      const user = await this.model.findOne({ where: { email } });
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
      return { errCode: -1, errMessage: error.message };
    }
  }

  async rotateRefreshToken(refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      if (!decoded) return { errCode: 1, errMessage: "Refresh token không hợp lệ" };

      const user = await this.model.findByPk(decoded.id);
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
      return { errCode: -1, errMessage: error.message };
    }
  }

  async revokeRefreshToken(userId) {
    try {
      const user = await this.model.findByPk(userId);
      if (user) await user.update({ refreshTokenHash: null, refreshTokenExpiresAt: null });
      return { errCode: 0 };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }

  async forgotPassword(email) {
    try {
      const user = await this.model.findOne({ where: { email } });
      if (!user) return { errCode: 1, errMessage: "Email không tồn tại" };

      const resetToken = uuidv4();
      user.resetToken = hashToken(resetToken);
      user.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      await sendForgotPasswordEmail(user, resetToken);
      return { errCode: 0, errMessage: "Gửi email thành công!" };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }

  async verifyResetToken(email, token) {
    try {
      const user = await this.model.findOne({ where: { email } });
      if (!user || user.resetToken !== hashToken(token)) return { errCode: 1, errMessage: "Token không hợp lệ" };
      if (user.resetTokenExpiresAt < new Date()) return { errCode: 2, errMessage: "Token đã hết hạn" };
      return { errCode: 0 };
    } catch (error) {
      return { errCode: -1, errMessage: error.message };
    }
  }

  async resetPassword(email, token, newPassword) {
    try {
      const user = await this.model.findOne({ where: { email } });
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
      const user = await this.model.findOne({ where: { email } });
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
      const user = await this.model.findOne({ where: { email } });
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

  async updateUserPassword(userId, oldPassword, newPassword) {
    try {
      const user = await this.model.findByPk(userId);
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

module.exports = new UserService();
