const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const passport = require("passport");

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const app = express();
app.set("trust proxy", 1);

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'"
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
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "https://tientech-shop-9247.vercel.app",
];

if (process.env.FRONTEND_URL) {
  const cleanFrontendUrl = process.env.FRONTEND_URL.trim().replace(/\/+$/, "");
  if (!allowedOrigins.includes(cleanFrontendUrl)) {
    allowedOrigins.push(cleanFrontendUrl);
  }
}

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
      "Accept",
      "Cache-Control",
      "Pragma",
    ],
  })
);

/*
BODY PARSER & COOKIE PARSER
*/
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

/*
CSRF PROTECTION FOR COOKIE-AUTHENTICATED MUTATIONS
*/
app.use((req, res, next) => {
  const mutationMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (!mutationMethods.includes(req.method)) {
    return next();
  }

  // Bypass CSRF for public payment webhooks / unauthenticated endpoints
  const path = req.originalUrl || req.path || "";
  if (
    path.includes("/vnpay/vnpay_ipn") ||
    path.includes("/vnpay_ipn") ||
    path.includes("/webhook") ||
    path.includes("/user/forgot-password") ||
    path.includes("/user/login") ||
    path.includes("/user/create-new-user") ||
    path.includes("/user/verify-otp") ||
    path.includes("/user/refresh-token")
  ) {
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
          errMessage: "Forbidden: CSRF Origin/Referer check failed",
        });
      }
    } else if (process.env.NODE_ENV !== "test") {
      return res.status(403).json({
        status: "FORBIDDEN",
        statusCode: 403,
        errCode: 403,
        errMessage: "Forbidden: CSRF verification missing required Origin header",
      });
    }
  }

  next();
});

/*
RATE LIMITER
*/
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 1000 : 20000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    errCode: 429,
    errMessage: "Too many requests, please try again later.",
  },
});

app.use("/api/", generalLimiter);

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    errCode: 429,
    errMessage:
      "Too many password reset requests. Please try again in 15 minutes.",
  },
});

app.use("/api/v1/user/forgot-password", forgotPasswordLimiter);

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
      stack: err.stack,
      error: err,
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        errCode: err.errCode,
        errMessage: err.message,
      });
    } else {
      console.error("ERROR 💥", err);
      res.status(500).json({
        status: "error",
        errCode: -1,
        errMessage: "Something went very wrong!",
      });
    }
  }
});

module.exports = app;
