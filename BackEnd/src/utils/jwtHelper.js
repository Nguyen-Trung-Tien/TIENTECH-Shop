const jwt = require("jsonwebtoken");
require("dotenv").config();

const getAccessSecret = () =>
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "tientech_jwt_access_secret_fallback";
const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "tientech_jwt_refresh_secret_fallback";

// Tạo Access Token
const generateAccessToken = (payload) => {
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
  });
};

// Tạo Refresh Token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
  });
};

// Verify Access Token (Basic)
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, getAccessSecret());
  } catch (e) {
    return null;
  }
};

// Verify Access Token (Detailed with expiration & error check)
const verifyAccessTokenDetailed = (token) => {
  try {
    const decoded = jwt.verify(token, getAccessSecret());
    return { valid: true, expired: false, decoded };
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return { valid: false, expired: true, error: e };
    }
    return { valid: false, expired: false, error: e };
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, getRefreshSecret());
  } catch (e) {
    return null;
  }
};

const verifyRefreshTokenDetailed = (token) => {
  try {
    const decoded = jwt.verify(token, getRefreshSecret());
    return { valid: true, expired: false, decoded };
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return { valid: false, expired: true, error: e };
    }
    return { valid: false, expired: false, error: e };
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyAccessTokenDetailed,
  verifyRefreshToken,
  verifyRefreshTokenDetailed,
};
