const { verifyAccessTokenDetailed } = require("../utils/jwtHelper");
const { getCache } = require("../config/redis");
const { getTokenBlacklistKey } = require("../services/user/AuthHelper");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  // Nếu không có token trong header, thử lấy từ cookie
  if (!token) {
    token = req.cookies?.accessToken;
  }

  if (!token) {
    return res
      .status(401)
      .json({ errCode: 1, code: "NO_TOKEN", errMessage: "No token provided" });
  }

  // Check Redis Token Blacklist (Revoked tokens on logout)
  const isBlacklisted = await getCache(getTokenBlacklistKey(token));
  if (isBlacklisted) {
    return res
      .status(401)
      .json({ errCode: 2, code: "TOKEN_REVOKED", errMessage: "Token has been revoked" });
  }

  const result = verifyAccessTokenDetailed(token);
  if (!result.valid) {
    if (result.expired) {
      return res
        .status(401)
        .json({ errCode: 2, code: "TOKEN_EXPIRED", errMessage: "Access token has expired" });
    }
    return res
      .status(401)
      .json({ errCode: 2, code: "INVALID_TOKEN", errMessage: "Invalid token" });
  }

  req.user = result.decoded;
  next();
};

const optionalAuthenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    token = req.cookies?.accessToken;
  }

  if (token) {
    const isBlacklisted = await getCache(getTokenBlacklistKey(token));
    if (!isBlacklisted) {
      const result = verifyAccessTokenDetailed(token);
      if (result.valid) {
        req.user = result.decoded;
      }
    }
  }
  next();
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles || !req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        errCode: 3,
        code: "FORBIDDEN",
        errMessage: "You are not allowed to access this resource",
      });
    }
    next();
  };
};

const checkMaintenanceMode = async (req, res, next) => {
  const path = req.originalUrl || req.path || "";
  // Bypass maintenance for admin routes, system settings, healthcheck, login
  if (
    path.startsWith("/healthz") ||
    path.includes("/system-settings") ||
    path.includes("/user/login") ||
    path.includes("/admin")
  ) {
    return next();
  }

  try {
    const SystemSettingService = require("../services/system/SystemSettingService");
    const isMaintenance = await SystemSettingService.getSetting("MAINTENANCE_MODE", false);
    if (isMaintenance === true || isMaintenance === "true") {
      // If user is admin, allow
      const authHeader = req.headers["authorization"];
      let token = authHeader && authHeader.split(" ")[1];
      if (!token) token = req.cookies?.accessToken;
      if (token) {
        const result = verifyAccessTokenDetailed(token);
        if (result.valid && (result.decoded.role === "admin" || result.decoded.role === "root")) {
          return next();
        }
      }

      const message = await SystemSettingService.getSetting(
        "MAINTENANCE_MESSAGE",
        "TIENTECH đang tiến hành bảo trì & nâng cấp hệ thống định kỳ. Quý khách vui lòng quay lại sau ít phút!"
      );

      return res.status(503).json({
        errCode: 503,
        isMaintenance: true,
        errMessage: message,
      });
    }
  } catch (err) {
    console.error("Maintenance check error:", err);
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  authorizeRole,
  checkMaintenanceMode,
};

