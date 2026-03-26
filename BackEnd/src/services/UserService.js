const db = require("../models");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
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

const checkUserEmail = async (email) => {
  const user = await db.User.findOne({ where: { email } });
  return !!user;
};

/**
 * Helper to upload image to Cloudinary
 * @param {string|Buffer} file - Base64 string or file buffer
 * @returns {Promise<string>} - Cloudinary URL
 */
const uploadToCloudinary = async (file) => {
  try {
    const options = {
      folder: "avatars",
      resource_type: "auto",
    };
    
    let result;
    if (typeof file === "string" && file.startsWith("data:image")) {
      // Handle base64
      result = await cloudinary.uploader.upload(file, options);
    } else if (Buffer.isBuffer(file)) {
      // Handle buffer from multer
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
        uploadStream.end(file);
      });
    } else {
        throw new Error("Invalid file format for Cloudinary upload");
    }
    
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

const createNewUser = async (data) => {
  try {
    const emailExists = await checkUserEmail(data.email);
    if (emailExists) {
      return {
        errCode: 1,
        errMessage: "Email đã tồn tại, vui lòng sử dụng email khác.",
      };
    }

    const hashedPassword = await hashUserPassword(data.password);
    const verificationToken = generateRandomToken();
    const verificationTokenHash = hashToken(verificationToken);
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await db.User.create({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      phone: data.phone || null,
      address: data.address || null,
      role: "customer",
      avatar: null,
      isActive: false,
      verificationToken: verificationTokenHash,
      verificationTokenExpiresAt,
    });

    await sendVerificationEmail(user, verificationToken);

    return { errCode: 0, errMessage: "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản." };
  } catch (error) {
    console.error("createNewUser error:", error);
    return {
      errCode: 2,
      errMessage: "Lỗi từ server",
    };
  }
};

const handleUserLogin = async (email, password) => {
  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return { errCode: 1, errMessage: "Không tìm thấy người dùng!" };
    }

    if (!user.isActive) {
        return { errCode: 3, errMessage: "Tài khoản chưa được kích hoạt. Vui lòng xác nhận email!" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { errCode: 2, errMessage: "Mật khẩu không chính xác!" };
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const refreshTokenExpiresAt = getTokenExpiryDate(refreshToken);

    await user.update({
      refreshTokenHash: hashToken(refreshToken),
      refreshTokenExpiresAt,
    });

    const { password: _, ...userData } = user.toJSON();
    return {
      errCode: 0,
      errMessage: "Đăng nhập thành công!",
      data: { user: userData, accessToken, refreshToken },
    };
  } catch (error) {
    console.error("User login error:", error);
    return { errCode: -1, errMessage: "Lỗi từ server!" };
  }
};

const updateUser = async (userId, data, currentUserRole = "customer") => {
  try {
    const user = await db.User.findByPk(userId);
    if (!user) return { errCode: 1, errMessage: "Không tìm thấy người dùng" };

    if (data.email && data.email !== user.email) {
      const emailExists = await checkUserEmail(data.email);
      if (emailExists) {
        return { errCode: 1, errMessage: "Email đã được sử dụng" };
      }
    }

    const fields = ["username", "email", "phone", "address"];
    fields.forEach((field) => {
      if (data[field] !== undefined) user[field] = data[field];
    });

    // Hardening: Only Admin can change role
    if (data.role && currentUserRole === "admin") {
        user.role = data.role;
    }

    // Avatar upload (handle base64 OR buffer)
    if (data.avatar) {
        user.avatar = await uploadToCloudinary(data.avatar);
    } else if (data.file) {
        user.avatar = await uploadToCloudinary(data.file.buffer);
    }

    await user.save();
    const { password, ...userData } = user.toJSON();
    return { errCode: 0, errMessage: "Cập nhật thành công", data: userData };
  } catch (err) {
    console.error("updateUser error:", err);
    return { errCode: 2, errMessage: "Lỗi từ server" };
  }
};

const getUserById = async (userId) => {
  try {
    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return { errCode: 1, errMessage: "Không tìm thấy người dùng" };
    
    return { errCode: 0, errMessage: "OK", data: user.toJSON() };
  } catch (e) {
    console.error("getUserById error:", e);
    return { errCode: 2, errMessage: "Lỗi từ server" };
  }
};

const getAllUsers = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const { rows: users, count: totalUsers } = await db.User.findAndCountAll({
      attributes: { exclude: ["password"] },
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });

    const data = users.map((user) => user.toJSON());
    const totalPages = Math.ceil(totalUsers / limit);

    return {
      errCode: 0,
      errMessage: "OK",
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
      },
      data,
    };
  } catch (e) {
    console.error("getAllUsers error:", e);
    throw e;
  }
};

const deleteUser = async (userId) => {
  try {
    const user = await db.User.findByPk(userId);
    if (!user) {
      return { errCode: 1, errMessage: "Không tìm thấy người dùng" };
    }

    await user.destroy();
    return { errCode: 0, errMessage: "Xóa người dùng thành công" };
  } catch (e) {
    console.error("Error deleting user:", e);
    throw e;
  }
};

const updateUserPassword = async (userId, oldPassword, newPassword) => {
  try {
    const user = await db.User.findByPk(userId);
    if (!user) {
      return { errCode: 1, errMessage: "Không tìm thấy người dùng" };
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return { errCode: 2, errMessage: "Mật khẩu cũ không chính xác" };
    }

    const hashedNewPassword = await hashUserPassword(newPassword);
    user.password = hashedNewPassword;

    await user.save();

    return { errCode: 0, errMessage: "Cập nhật mật khẩu thành công" };
  } catch (error) {
    console.error("Error updating password:", error);
    return { errCode: 3, errMessage: "Lỗi khi cập nhật mật khẩu" };
  }
};

const forgotPassword = async (email) => {
  const user = await db.User.findOne({ where: { email } });
  if (!user) return { errCode: 1, errMessage: "Email không tồn tại" };

  const resetToken = uuidv4();
  const resetTokenHash = hashToken(resetToken);
  const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  user.resetToken = resetTokenHash;
  user.resetTokenExpiresAt = resetTokenExpiresAt;
  await user.save();

  await sendForgotPasswordEmail(user, resetToken);
  return { errCode: 0, errMessage: "Gửi email thành công!" };
};

const verifyResetToken = async (email, token) => {
  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) return { errCode: 1, errMessage: "Không tìm thấy email!" };

    if (!user.resetToken) {
      return { errCode: 2, errMessage: "Không yêu cầu khôi phục mật khẩu" };
    }

    const tokenHash = hashToken(token);
    if (user.resetToken !== tokenHash) {
      return { errCode: 3, errMessage: "Mã xác nhận không hợp lệ!" };
    }

    if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < new Date()) {
      return { errCode: 4, errMessage: "Mã xác nhận đã hết hạn!" };
    }

    return { errCode: 0, errMessage: "Mã xác nhận hợp lệ!" };
  } catch (err) {
    console.error("verifyResetToken error:", err);
    return { errCode: 2, errMessage: "Lỗi từ server!" };
  }
};

const resetPassword = async (email, token, newPassword) => {
  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) return { errCode: 1, errMessage: "Không tìm thấy email!" };

    const tokenHash = hashToken(token);
    if (user.resetToken !== tokenHash) {
      return {
        errCode: 2,
        errMessage: "Token không tìm thấy!",
      };
    }

    if (user.resetTokenExpiresAt && user.resetTokenExpiresAt < new Date()) {
      return { errCode: 3, errMessage: "Token đã hết hạn!" };
    }

    const hashedPassword = await hashUserPassword(newPassword);
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiresAt = null;
    await user.save();

    return { errCode: 0, errMessage: "Đổi mật khẩu thành công!" };
  } catch (err) {
    console.error("resetPassword error:", err);
    return { errCode: 2, errMessage: "Lỗi từ server!" };
  }
};
const rotateRefreshToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) return { errCode: 1, errMessage: "Refresh token không hợp lệ" };

  const user = await db.User.findByPk(decoded.id);
  if (!user || !user.refreshTokenHash) {
    return { errCode: 2, errMessage: "Refresh token đã bị thu hồi" };
  }

  const tokenHash = hashToken(refreshToken);
  if (user.refreshTokenHash !== tokenHash) {
    return { errCode: 3, errMessage: "Refresh token không khớp" };
  }

  if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) {
    return { errCode: 4, errMessage: "Refresh token đã hết hạn" };
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);
  const newRefreshTokenExpiresAt = getTokenExpiryDate(newRefreshToken);

  await user.update({
    refreshTokenHash: hashToken(newRefreshToken),
    refreshTokenExpiresAt: newRefreshTokenExpiresAt,
  });

  return {
    errCode: 0,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  };
};

const revokeRefreshToken = async (userId) => {
  const user = await db.User.findByPk(userId);
  if (!user) return { errCode: 1, errMessage: "Không tìm thấy người dùng" };

  await user.update({ refreshTokenHash: null, refreshTokenExpiresAt: null });
  return { errCode: 0, errMessage: "Đã thu hồi refresh token" };
};

const verifyEmail = async (email, token) => {
  try {
    const user = await db.User.findOne({ where: { email } });
    if (!user) return { errCode: 1, errMessage: "Không tìm thấy người dùng!" };

    if (user.isActive) return { errCode: 0, errMessage: "Tài khoản đã được xác nhận từ trước." };

    const tokenHash = hashToken(token);
    if (user.verificationToken !== tokenHash) {
      return { errCode: 2, errMessage: "Mã xác nhận không chính xác!" };
    }

    if (user.verificationTokenExpiresAt && user.verificationTokenExpiresAt < new Date()) {
      return { errCode: 3, errMessage: "Mã xác nhận đã hết hạn!" };
    }

    user.isActive = true;
    user.verificationToken = null;
    user.verificationTokenExpiresAt = null;
    await user.save();

    return { errCode: 0, errMessage: "Xác nhận tài khoản thành công!" };
  } catch (err) {
    console.error("verifyEmail error:", err);
    return { errCode: -1, errMessage: "Lỗi từ server!" };
  }
};

const resendVerificationEmail = async (email) => {
    try {
        const user = await db.User.findOne({ where: { email } });
        if (!user) return { errCode: 1, errMessage: "Email không tồn tại" };
        if (user.isActive) return { errCode: 2, errMessage: "Tài khoản đã được xác nhận" };

        const verificationToken = generateRandomToken();
        const verificationTokenHash = hashToken(verificationToken);
        const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        user.verificationToken = verificationTokenHash;
        user.verificationTokenExpiresAt = verificationTokenExpiresAt;
        await user.save();

        await sendVerificationEmail(user, verificationToken);
        return { errCode: 0, errMessage: "Đã gửi lại email xác nhận!" };
    } catch (error) {
        console.error("resendVerificationEmail error:", error);
        return { errCode: -1, errMessage: "Lỗi từ server" };
    }
};

module.exports = {
  createNewUser,
  handleUserLogin,
  verifyRefreshToken,
  generateAccessToken,
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUserPassword,
  verifyResetToken,
  resetPassword,
  forgotPassword,
  rotateRefreshToken,
  revokeRefreshToken,
  verifyEmail,
  resendVerificationEmail,
};
