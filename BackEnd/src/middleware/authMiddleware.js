const { verifyAccessTokenDetailed } = require("../utils/jwtHelper");
const { getCache, setCache } = require("../config/redis");
const { getTokenBlacklistKey, getUserStatusKey } = require("../services/user/AuthHelper");

const resolveUserStatus = async (userId) => {
  const statusKey = getUserStatusKey(userId);
  let userStatus = await getCache(statusKey);

  if (!userStatus) {
    try {
      const db = require("../models");
      const dbUser = await db.User.findByPk(userId, {
        attributes: ["id", "isActive", "role", "tokenVersion"],
      });
      if (!dbUser) {
        return { notFound: true };
      }
      userStatus = {
        isActive: Boolean(dbUser.isActive),
        role: dbUser.role,
        ...(typeof dbUser.tokenVersion === "number"
          ? { tokenVersion: dbUser.tokenVersion }
          : {}),
      };
      await setCache(statusKey, userStatus, 300);
    } catch (dbErr) {
      console.error("AuthMiddleware status check error:", dbErr?.message);
    }
  }
  return { userStatus };
};

const isTokenVersionStale = (decoded, userStatus) => {
  return (
    typeof userStatus?.tokenVersion === "number" &&
    typeof decoded?.ver === "number" &&
    decoded.ver !== userStatus.tokenVersion
  );
};

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

  const userId = result.decoded?.id;
  if (userId) {
    const { notFound, userStatus } = await resolveUserStatus(userId);
    if (notFound) {
      return res.status(401).json({
        errCode: 2,
        code: "USER_NOT_FOUND",
        errMessage: "Người dùng không tồn tại",
      });
    }

    if (userStatus && !userStatus.isActive) {
      return res.status(403).json({
        errCode: 3,
        code: "ACCOUNT_LOCKED",
        errMessage: "Tài khoản của bạn đã bị khóa hoặc tạm ngưng hoạt động. Vui lòng liên hệ quản trị viên.",
      });
    }

    if (isTokenVersionStale(result.decoded, userStatus)) {
      return res.status(401).json({
        errCode: 2,
        code: "TOKEN_REVOKED",
        errMessage: "Phiên đăng nhập đã hết hiệu lực. Vui lòng đăng nhập lại.",
      });
    }

    req.user = {
      ...result.decoded,
      role: userStatus?.role || result.decoded.role,
    };
  } else {
    req.user = result.decoded;
  }
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
        const userId = result.decoded?.id;
        if (userId) {
          const { userStatus } = await resolveUserStatus(userId);
          if (userStatus && userStatus.isActive && !isTokenVersionStale(result.decoded, userStatus)) {
            req.user = { ...result.decoded, role: userStatus.role || result.decoded.role };
          }
        } else {
          req.user = result.decoded;
        }
      }
    }
  }
  next();
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        errCode: 1,
        code: "UNAUTHORIZED",
        errMessage: "Unauthorized",
      });
    }
    const userRole = req.user.role;
    const hasRole =
      (roles && roles.includes(userRole)) ||
      (userRole === "root" && roles && roles.includes("admin"));

    if (!roles || !hasRole) {
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

