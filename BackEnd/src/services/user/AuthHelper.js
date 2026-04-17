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

module.exports = {
  hashToken,
  generateRandomToken,
  getTokenExpiryDate,
  hashUserPassword,
};
