const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/connectDB");
const ProductService = require("./services/product/ProductService");
const { initOrderCron } = require("./cron/orderCron");
const { initInventoryCron } = require("./cron/inventoryCron");
const { verifyAccessToken } = require("./utils/jwtHelper");
const { getCache } = require("./config/redis");
const { getTokenBlacklistKey } = require("./services/user/AuthHelper");

const server = http.createServer(app);

/*
CORS CONFIG FOR SOCKET
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

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

/*
DATABASE & CRON JOBS
*/
if (process.env.NODE_ENV !== "test") {
  connectDB();

  initOrderCron();
  initInventoryCron();

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

/*
SOCKET CONNECTION & AUTHENTICATION
*/
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers?.authorization &&
        socket.handshake.headers.authorization.split(" ")[1]) ||
      socket.handshake.headers?.cookie
        ?.split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

    if (token) {
      const isBlacklisted = await getCache(getTokenBlacklistKey(token));
      if (!isBlacklisted) {
        const decoded = verifyAccessToken(token);
        if (decoded) {
          socket.user = decoded;
        }
      }
    }
  } catch (err) {
    console.error("Socket authentication error:", err);
  }
  next();
});

io.on("connection", (socket) => {
  // Automatically isolate authenticated user into personal room for order/notification updates
  if (socket.user && socket.user.id) {
    socket.join(`user_${socket.user.id}`);
  }

  socket.on("join_admin", () => {
    if (socket.user && ["admin", "root"].includes(socket.user.role)) {
      socket.join("admin_room");
      console.log(
        `Socket ${socket.id} (Role: ${socket.user.role}, ID: ${socket.user.id}) joined admin_room`
      );
    } else {
      console.warn(`Unauthorized join_admin attempt by socket ${socket.id}`);
      socket.emit("error", {
        errCode: 403,
        errMessage: "Unauthorized: Admin access required",
      });
    }
  });

  socket.on("disconnect", () => {
    // Socket disconnected
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
