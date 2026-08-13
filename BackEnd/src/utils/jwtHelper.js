const jwt = require("jsonwebtoken");
require("dotenv").config();

// Tạo Access Token
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES,
  });
};

// Tạo Refresh Token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES,
  });
};

// Verify Access Token (Basic)
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (e) {
    return null;
  }
};

// Verify Access Token (Detailed with expiration & error check)
const verifyAccessTokenDetailed = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
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
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    return null;
  }
};

const verifyRefreshTokenDetailed = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
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
