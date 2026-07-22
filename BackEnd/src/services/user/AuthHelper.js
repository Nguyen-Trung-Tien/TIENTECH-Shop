const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

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

const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: "Mật khẩu phải có ít nhất 8 ký tự!" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Mật khẩu phải chứa ít nhất 1 chữ cái in hoa (A-Z)!" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Mật khẩu phải chứa ít nhất 1 chữ số (0-9)!" };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, message: "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...)!" };
  }
  return { valid: true };
};

module.exports = {
  hashToken,
  generateRandomToken,
  getTokenExpiryDate,
  hashUserPassword,
  validatePasswordStrength,
};
