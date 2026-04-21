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

const app = express();
app.set("trust proxy", 1);
app.use(passport.initialize());
const server = http.createServer(app);
// ... existing server/io setup ...
// I will just add the initialization inside the if (process.env.NODE_ENV !== "test") block

const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "https://tientech-shop-9247.vercel.app",
    ],
    credentials: true,
  },
});

// Gắn io vào app để dùng ở các controller khác (req.app.get("io"))
app.set("io", io);

const allowedOrigins = [
  "http://localhost:5173",
  "https://tientech-shop-9247.vercel.app",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("CORS blocked"));
      }
    },
    credentials: true,
  }),
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
// Body parser
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// Cookie - Phải đặt TRƯỚC routes
app.use(cookieParser());

// General API rate limiter (1000 req / 15 min per IP)
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

// Forgot password: stricter rate limit (5 requests / 15 min per IP)
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

// Static
app.use(express.static("public"));

app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
routes(app);

// Global error handler — phải đặt SAU routes
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[GlobalErrorHandler]", err.stack || err);
  res.status(err.status || 500).json({
    errCode: -1,
    errMessage: err.message || "Internal Server Error",
  });
});

// Connect DB
if (process.env.NODE_ENV !== "test") {
  connectDB();
  initOrderCron();

  // Cron: disable expired flash sales every minute
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

// Socket.io connection logic
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

const port = process.env.PORT || 8080;
if (require.main === module) {
  server.listen(port, () => {
    console.log(`Connect server success, ${port}`);
  });
}

module.exports = { app, server };
