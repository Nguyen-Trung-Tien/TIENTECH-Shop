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

const DUMMY_PASSWORD_HASH = "$2a$10$e8wYf/48Z/b4j0G9N.4SVO4cWd6E3jS2.yO15ZJ2hW1mK/Gg3V7gK";

const performDummyBcryptCompare = async (password) => {
  try {
    await bcrypt.compare(password || "dummyPassword123!", DUMMY_PASSWORD_HASH);
  } catch (e) {
    // Ignore dummy compare errors
  }
};

const getUserProfileKey = (userId) => `user:profile:${userId}`;
const getRefreshTokenKey = (userId) => `user:refreshtoken:${userId}`;
const getTokenBlacklistKey = (token) => `blacklist:token:${hashToken(token)}`;

module.exports = {
  hashToken,
  generateRandomToken,
  getTokenExpiryDate,
  hashUserPassword,
  validatePasswordStrength,
  performDummyBcryptCompare,
  getUserProfileKey,
  getRefreshTokenKey,
  getTokenBlacklistKey,
};

