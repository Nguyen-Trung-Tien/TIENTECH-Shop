const { Sequelize } = require("sequelize");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const db = require("../models");

let connectDB = async () => {
  try {
    await db.sequelize.authenticate();
    console.log(`Database connected successfully (${isProduction ? 'Production' : 'Development'})`);

    // Ensure newly added tables such as AuditLogs exist in database (TiDB / MySQL)
    if (db.AuditLog) {
      await db.AuditLog.sync({ alter: false }).catch((err) => {
        console.warn("[connectDB] AuditLog auto-sync notice:", err.message);
      });
    }
  } catch (error) {
    console.error("Unable to connect to database:", error);
  }
};

module.exports = connectDB;
