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
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
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
