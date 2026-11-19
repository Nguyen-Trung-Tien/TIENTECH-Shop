const http = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const app = require("./app");
const connectDB = require("./config/connectDB");
const db = require("./models");
const ProductService = require("./services/product/ProductService");
const SystemSettingService = require("./services/system/SystemSettingService");
const { initOrderCron } = require("./cron/orderCron");
const { initInventoryCron } = require("./cron/inventoryCron");
const { verifyAccessToken } = require("./utils/jwtHelper");
const {
  redisClient,
  getCache,
  isRedisConnected,
  acquireCronLock,
  releaseLock,
} = require("./config/redis");
const { getTokenBlacklistKey } = require("./services/user/AuthHelper");
const { getAllowedOrigins } = require("./config/corsConfig");
const { resolveUserStatus, isTokenVersionStale } = require("./utils/authTokenValidator");
const VectorIndexService = require("./services/ai/VectorIndexService");

const server = http.createServer(app);

/*
CORS CONFIG FOR SOCKET
*/
const allowedOrigins = getAllowedOrigins();

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

let orderCronTask = null;
let inventoryCronTask = null;
let flashSaleInterval = null;
let redisPubClient = null;
let redisSubClient = null;
let isShuttingDown = false;

const attachSocketRedisAdapter = async () => {
  if (process.env.NODE_ENV === "test") return;

  const wireAdapter = async () => {
    if (redisPubClient || !isRedisConnected()) return;
    try {
      redisPubClient = redisClient.duplicate();
      redisSubClient = redisClient.duplicate();
      redisPubClient.on("error", (err) => console.warn("[Socket.IO Redis Pub]", err?.message));
      redisSubClient.on("error", (err) => console.warn("[Socket.IO Redis Sub]", err?.message));
      await Promise.all([redisPubClient.connect(), redisSubClient.connect()]);
      io.adapter(createAdapter(redisPubClient, redisSubClient));
      console.log("[Socket.IO] Redis adapter enabled");
    } catch (err) {
      console.warn("[Socket.IO] Failed to enable Redis adapter, using memory adapter:", err?.message);
      redisPubClient = null;
      redisSubClient = null;
    }
  };

  if (isRedisConnected()) {
    await wireAdapter();
  } else if (redisClient && typeof redisClient.once === "function") {
    redisClient.once("ready", () => {
      wireAdapter().catch(() => {});
    });
  }
};

/*
DATABASE & CRON JOBS
*/
if (process.env.NODE_ENV !== "test") {
  (async () => {
    await connectDB();
    await SystemSettingService.initializeDefaultSettings();
    await attachSocketRedisAdapter();
    await VectorIndexService.loadFromDatabase();
    await VectorIndexService.initPubSub();
  })().catch((err) => {
    console.error("[Server Startup] Init error:", err?.message);
  });

  orderCronTask = initOrderCron();
  inventoryCronTask = initInventoryCron();

  const flashSaleJob = async () => {
    const lockToken = await acquireCronLock("flash_sale_expiry", 55);
    if (!lockToken) return;
    try {
      await ProductService.disableExpiredFlashSales();
    } catch (error) {
      console.error("Flash sale cron error:", error);
    } finally {
      await releaseLock("cron:flash_sale_expiry", lockToken);
    }
  };

  flashSaleJob();
  flashSaleInterval = setInterval(flashSaleJob, 60 * 1000);
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
      if (isBlacklisted) {
        return next(new Error("UNAUTHORIZED: Token revoked"));
      }
      const decoded = verifyAccessToken(token);
      if (!decoded) {
        return next(new Error("UNAUTHORIZED: Invalid or expired token"));
      }
      if (decoded.id) {
        const { notFound, userStatus } = await resolveUserStatus(decoded.id);
        if (notFound || !userStatus?.isActive || isTokenVersionStale(decoded, userStatus)) {
          return next(new Error("UNAUTHORIZED: Account inactive or session expired"));
        }
        socket.user = { ...decoded, role: userStatus.role || decoded.role };
      } else {
        socket.user = decoded;
      }
    }
  } catch (err) {
    console.error("Socket authentication error:", err);
    return next(new Error("UNAUTHORIZED: Authentication failed"));
  }
  next();
});

io.on("connection", (socket) => {
  if (socket.user && socket.user.id) {
    socket.join(`user_${socket.user.id}`);
  }

  socket.on("join", (room) => {
    if (typeof room === "string") {
      if (room.startsWith("user_")) {
        const targetUserId = room.replace("user_", "");
        if (
          socket.user &&
          (String(socket.user.id) === targetUserId ||
            ["admin", "root"].includes(socket.user.role))
        ) {
          socket.join(room);
        }
      } else if (
        room === "admin_room" &&
        socket.user &&
        ["admin", "root"].includes(socket.user.role)
      ) {
        socket.join("admin_room");
      }
    }
  });

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
GRACEFUL SHUTDOWN
*/
const shutdown = async (signal = "SIGTERM") => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`[Server] Received ${signal}. Starting graceful shutdown...`);

  const forceTimer = setTimeout(() => {
    console.error("[Server] Forced shutdown after 10s timeout");
    process.exit(1);
  }, 10000);
  if (typeof forceTimer.unref === "function") forceTimer.unref();

  try {
    if (orderCronTask && typeof orderCronTask.stop === "function") orderCronTask.stop();
    if (inventoryCronTask && typeof inventoryCronTask.stop === "function") inventoryCronTask.stop();
    if (flashSaleInterval) clearInterval(flashSaleInterval);

    await new Promise((resolve) => io.close(() => resolve()));
    if (server.listening) {
      await new Promise((resolve) => server.close(() => resolve()));
    }

    await Promise.allSettled([
      VectorIndexService.shutdown(),
      redisPubClient?.quit?.(),
      redisSubClient?.quit?.(),
      redisClient?.isOpen ? redisClient.quit() : Promise.resolve(),
      db?.sequelize?.close?.(),
    ]);

    clearTimeout(forceTimer);
    console.log("[Server] Graceful shutdown completed.");
  } catch (err) {
    console.error("[Server] Error during graceful shutdown:", err);
  }
};

/*
START SERVER
*/
const port = process.env.PORT || 8080;

if (require.main === module) {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  process.on("SIGTERM", () => {
    shutdown("SIGTERM").finally(() => process.exit(0));
  });
  process.on("SIGINT", () => {
    shutdown("SIGINT").finally(() => process.exit(0));
  });
}

module.exports = { app, server, io, shutdown };
