const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routers");
const connectDB = require("./config/connectDB");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const ProductService = require("./services/ProductService");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Gắn io vào app để dùng ở các controller khác (req.app.get("io"))
app.set("io", io);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Body parser
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
// Cookie - Phải đặt TRƯỚC routes
app.use(cookieParser());

// General API rate limiter (100 req / 15 min per IP)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errCode: 429, errMessage: "Too many requests, please try again later." },
});
app.use("/api/", generalLimiter);

// Forgot password: stricter rate limit (5 requests / 15 min per IP)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { errCode: 429, errMessage: "Too many password reset requests. Please try again in 15 minutes." },
});
app.use("/api/v1/user/forgot-password", forgotPasswordLimiter);

// Static
app.use(express.static("public"));

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
