const jwt = require("jsonwebtoken");
require("dotenv").config();

const getAccessSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL CONFIG ERROR: JWT_ACCESS_SECRET is required in production environment!");
    }
    return "dev_local_access_secret_do_not_use_in_prod";
  }
  return secret;
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL CONFIG ERROR: JWT_REFRESH_SECRET is required in production environment!");
    }
    return "dev_local_refresh_secret_do_not_use_in_prod";
  }
  return secret;
};

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
