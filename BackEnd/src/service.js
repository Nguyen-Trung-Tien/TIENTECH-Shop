const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routers");
const connectDB = require("./config/connectDB");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

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

// Static
app.use(express.static("public"));

// Mount routes
routes(app);

// Connect DB
if (process.env.NODE_ENV !== "test") {
  connectDB();
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
