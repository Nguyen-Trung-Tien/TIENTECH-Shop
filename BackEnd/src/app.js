const express = require("express");
const crypto = require("crypto");
const dotenv = require("dotenv");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const passport = require("passport");
const { generalLimiter } = require("./middleware/rateLimiter");
const { getAllowedOrigins } = require("./config/corsConfig");

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const app = express();
app.set("trust proxy", 1);

// Request ID Middleware for error tracing
app.use((req, res, next) => {
  const reqId = req.headers["x-request-id"] || crypto.randomUUID();
  req.requestId = String(reqId);
  res.setHeader("X-Request-Id", req.requestId);
  next();
});

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  );
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (isProduction) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }
  next();
});

app.use(passport.initialize());

/*
CORS CONFIG
*/
const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        // Return false to let CORS middleware block the origin without throwing an uncaught 500 error
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-XSRF-TOKEN",
      "X-Idempotency-Key",
      "Accept",
      "Cache-Control",
      "Pragma",
    ],
    exposedHeaders: ["X-XSRF-TOKEN", "X-Idempotency-Replayed"],
  })
);

/*
BODY PARSER & COOKIE PARSER
*/
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

/*
EXPOSE XSRF-TOKEN HEADER FOR CROSS-ORIGIN FRONTENDS (CORS-RESTRICTED)
*/
app.use((req, res, next) => {
  if (req.cookies && req.cookies["XSRF-TOKEN"]) {
    res.setHeader("X-XSRF-TOKEN", req.cookies["XSRF-TOKEN"]);
  }
  next();
});

/*
CSRF PROTECTION FOR COOKIE-AUTHENTICATED MUTATIONS
*/
app.use((req, res, next) => {
  const mutationMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (!mutationMethods.includes(req.method)) {
    return next();
  }

  // Bypass CSRF for public payment webhooks / unauthenticated endpoints
  // Strip query parameters to prevent query-string injection bypass (e.g. ?bypass=/webhook)
  const normalizedPath = (req.originalUrl || req.path || "").split("?")[0].replace(/\/+$/, "") || "/";
  const CSRF_EXEMPT_EXACT = [
    "/api/v1/vnpay/vnpay_ipn",
    "/api/v1/vnpay/vnpay-ipn",
    "/api/v1/user/forgot-password",
    "/api/v1/user/reset-password",
    "/api/v1/user/login",
    "/api/v1/user/create",
    "/api/v1/user/create-new-user",
    "/api/v1/user/verify-otp",
    "/api/v1/user/verify-email",
  ];

  const isExempt =
    CSRF_EXEMPT_EXACT.includes(normalizedPath) ||
    normalizedPath.startsWith("/api/v1/webhook") ||
    normalizedPath.startsWith("/api/v1/vnpay/vnpay_ipn") ||
    normalizedPath.startsWith("/api/v1/vnpay/vnpay-ipn");

  if (isExempt) {
    return next();
  }

  const hasAuthCookie = req.cookies && (req.cookies.accessToken || req.cookies.refreshToken);
  if (hasAuthCookie) {
    const origin = req.headers["origin"];
    const referer = req.headers["referer"];

    let requestOrigin = null;
    if (origin) {
      requestOrigin = origin;
    } else if (referer) {
      try {
        const parsed = new URL(referer);
        requestOrigin = parsed.origin;
      } catch (err) {}
    }

    if (requestOrigin) {
      const isAllowed = allowedOrigins.some((allowed) => {
        return requestOrigin.toLowerCase() === allowed.toLowerCase();
      });
      if (!isAllowed) {
        return res.status(403).json({
          status: "FORBIDDEN",
          statusCode: 403,
          errCode: 403,
          code: "CSRF_ERROR",
          errMessage: "Forbidden: CSRF Origin/Referer check failed",
          message: "Forbidden: CSRF Origin/Referer check failed",
        });
      }
    } else if (process.env.NODE_ENV !== "test") {
      return res.status(403).json({
        status: "FORBIDDEN",
        statusCode: 403,
        errCode: 403,
        code: "CSRF_ERROR",
        errMessage: "Forbidden: CSRF verification missing required Origin header",
        message: "Forbidden: CSRF verification missing required Origin header",
      });
    }

    const xsrfCookie = req.cookies["XSRF-TOKEN"];
    if (xsrfCookie) {
      const xsrfHeader = req.headers["x-xsrf-token"];
      const cookieBuf = Buffer.from(String(xsrfCookie));
      const headerBuf = Buffer.from(String(xsrfHeader || ""));
      if (cookieBuf.length !== headerBuf.length || !crypto.timingSafeEqual(cookieBuf, headerBuf)) {
        return res.status(403).json({
          status: "FORBIDDEN",
          statusCode: 403,
          errCode: 403,
          code: "CSRF_ERROR",
          errMessage: "Forbidden: Invalid CSRF token",
          message: "Forbidden: Invalid CSRF token",
        });
      }
    }
  }

  next();
});

/*
RATE LIMITER
*/
app.use("/api/", generalLimiter);

/*
STATIC FILES
*/
app.use(express.static("public"));

/*
HEALTH CHECK
*/
app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/*
MAINTENANCE MODE CHECK
*/
const { checkMaintenanceMode } = require("./middleware/authMiddleware");
app.use(checkMaintenanceMode);

/*
ROUTES
*/
routes(app);

/*
GLOBAL ERROR HANDLER
*/
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.errCode = err.errCode || -1;

  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      status: err.status,
      errCode: err.errCode,
      errMessage: err.message,
      requestId: req.requestId,
      stack: err.stack,
      error: err,
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        errCode: err.errCode,
        errMessage: err.message,
        requestId: req.requestId,
      });
    } else {
      console.error(`ERROR [${req.requestId}] 💥`, err);
      res.status(500).json({
        status: "error",
        errCode: -1,
        errMessage: "Something went very wrong!",
        requestId: req.requestId,
      });
    }
  }
});

module.exports = app;
