const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routers");
const connectDB = require("./config/connectDB");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const app = express();

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

const port = process.env.PORT || 8080;
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Connect server success, ${port}`);
  });
}

module.exports = app;
