const { verifyAccessTokenDetailed } = require("../utils/jwtHelper");
const { getCache } = require("../config/redis");
const { getTokenBlacklistKey } = require("../services/user/AuthHelper");
const { resolveUserStatus, isTokenVersionStale } = require("../utils/authTokenValidator");

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  let token = authHeader && authHeader.split(" ")[1];

  // Nếu không có token trong header, thử lấy từ cookie
  if (!token) {
    token = req.cookies?.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      status: "UNAUTHORIZED",
      statusCode: 401,
      errCode: 1,
      code: "NO_TOKEN",
      errMessage: "Vui lòng đăng nhập để tiếp tục.",
      message: "No token provided",
    });
  }

  // Check Redis Token Blacklist (Revoked tokens on logout)
  const isBlacklisted = await getCache(getTokenBlacklistKey(token));
  if (isBlacklisted) {
    return res.status(401).json({
      status: "UNAUTHORIZED",
      statusCode: 401,
      errCode: 2,
      code: "TOKEN_REVOKED",
      errMessage: "Phiên đăng nhập đã bị hủy. Vui lòng đăng nhập lại.",
      message: "Token has been revoked",
    });
  }

  const result = verifyAccessTokenDetailed(token);
  if (!result.valid) {
    if (result.expired) {
      return res.status(401).json({
        status: "UNAUTHORIZED",
        statusCode: 401,
        errCode: 2,
        code: "TOKEN_EXPIRED",
        errMessage: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        message: "Access token has expired",
      });
    }
    return res.status(401).json({
      status: "UNAUTHORIZED",
      statusCode: 401,
      errCode: 2,
      code: "INVALID_TOKEN",
      errMessage: "Mã xác thực không hợp lệ.",
      message: "Invalid token",
    });
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
        status: "FORBIDDEN",
        statusCode: 403,
        errCode: 3,
        code: "ACCOUNT_LOCKED",
        errMessage: "Tài khoản của bạn đã bị khóa hoặc tạm ngưng hoạt động. Vui lòng liên hệ quản trị viên.",
        message: "Account locked",
      });
    }

    if (isTokenVersionStale(result.decoded, userStatus)) {
      return res.status(401).json({
        status: "UNAUTHORIZED",
        statusCode: 401,
        errCode: 2,
        code: "TOKEN_REVOKED",
        errMessage: "Phiên đăng nhập đã hết hiệu lực. Vui lòng đăng nhập lại.",
        message: "Token has been revoked",
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
        status: "UNAUTHORIZED",
        statusCode: 401,
        errCode: 1,
        code: "UNAUTHORIZED",
        errMessage: "Phiên đăng nhập đã hết hạn hoặc chưa được xác thực.",
        message: "Unauthorized",
      });
    }
    const userRole = req.user.role;
    const hasRole =
      (roles && roles.includes(userRole)) ||
      (userRole === "root" && roles && roles.includes("admin"));

    if (!roles || !hasRole) {
      return res.status(403).json({
        status: "FORBIDDEN",
        statusCode: 403,
        errCode: 3,
        code: "FORBIDDEN",
        errMessage: "Bạn không có quyền truy cập tài nguyên này.",
        message: "You are not allowed to access this resource",
      });
    }
    next();
  };
};

const checkMaintenanceMode = async (req, res, next) => {
  const rawPath = req.originalUrl || req.path || "";
  const normalizedPath = rawPath.split("?")[0].replace(/\/+$/, "") || "/";

  // Bypass maintenance for admin routes, system settings, healthcheck, auth refresh/logout, VNPay callbacks
  const MAINTENANCE_EXEMPT_EXACT = [
    "/healthz",
    "/api/v1/user/login",
    "/api/v1/user/refresh-token",
    "/api/v1/user/logout",
    "/api/v1/system/public",
    "/api/v1/system-settings/public",
  ];
  const MAINTENANCE_EXEMPT_PREFIXES = [
    "/api/v1/admin",
    "/api/v1/system-settings",
    "/api/v1/vnpay/vnpay_ipn",
    "/api/v1/vnpay/vnpay-ipn",
    "/api/v1/vnpay/vnpay_return",
    "/api/v1/vnpay/vnpay-return",
  ];

  const isExempt =
    MAINTENANCE_EXEMPT_EXACT.includes(normalizedPath) ||
    MAINTENANCE_EXEMPT_PREFIXES.some(
      (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
    );

  if (isExempt) {
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

