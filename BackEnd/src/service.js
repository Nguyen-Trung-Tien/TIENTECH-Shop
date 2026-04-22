const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routers");
const connectDB = require("./config/connectDB");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const ProductService = require("./services/product/ProductService");
const rateLimit = require("express-rate-limit");
const passport = require("passport");

const { initOrderCron } = require("./cron/orderCron");

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const app = express();
app.set("trust proxy", 1);

app.use(passport.initialize());

const server = http.createServer(app);

/*
CORS CONFIG (PRODUCTION READY)
*/
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3000",
  "https://tientech-shop-9247.vercel.app",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || isProduction) {
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
  }),
);

/*
SOCKET.IO CONFIG
*/

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

/*
BODY PARSER
*/

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

/*
COOKIE PARSER
*/

app.use(cookieParser());

/*
RATE LIMITER
*/

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
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
ROUTES
*/

routes(app);

/*
GLOBAL ERROR HANDLER
*/

app.use((err, req, res, next) => {
  console.error("[GlobalErrorHandler]", err.stack || err);

  res.status(err.status || 500).json({
    errCode: -1,
    errMessage: err.message || "Internal Server Error",
  });
});

/*DATABASE + CRON JOBS*/

if (process.env.NODE_ENV !== "test") {
  connectDB();

  initOrderCron();

  const flashSaleJob = async () => {
    try {
      await ProductService.disableExpiredFlashSales();
    } catch (error) {
      console.error("Flash sale cron error:", error);
    }
  };

  flashSaleJob();

  setInterval(flashSaleJob, 60 * 1000);
}

/*SOCKET CONNECTION*/

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_admin", () => {
    socket.join("admin_room");
    console.log(`Socket ${socket.id} joined admin_room`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

/*
START SERVER
*/

const port = process.env.PORT || 8080;

if (require.main === module) {
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}

module.exports = { app, server };
