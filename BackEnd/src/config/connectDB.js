require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const db = require("../models");

const ensureColumn = async (tableName, columnName, columnDef) => {
  try {
    const queryInterface = db.sequelize.getQueryInterface();
    const tableInfo = await queryInterface.describeTable(tableName);
    if (!tableInfo[columnName]) {
      await queryInterface.addColumn(tableName, columnName, columnDef);
      console.log(
        `[connectDB] Added missing ${columnName} column to ${tableName} table.`,
      );
    }
  } catch (err) {
    console.warn(
      `[connectDB] ${tableName}.${columnName} column check notice:`,
      err.message,
    );
  }
};

let connectDB = async () => {
  try {
    await db.sequelize.authenticate();
    console.log(
      `Database connected successfully (${isProduction ? "Production" : "Development"})`,
    );

    // Ensure newly added tables such as AuditLogs exist in database (TiDB / MySQL)
    if (db.AuditLog) {
      await db.AuditLog.sync({ alter: false }).catch((err) => {
        console.warn("[connectDB] AuditLog auto-sync notice:", err.message);
      });
    }

    // Ensure newly added columns exist in TiDB / MySQL production DBs where migrations weren't run
    if (db.Notification) {
      await ensureColumn("Notifications", "metadata", {
        type: db.Sequelize.JSON,
        allowNull: true,
      });
    }
    if (db.User) {
      await ensureColumn("Users", "tokenVersion", {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
    if (db.Order) {
      await ensureColumn("Orders", "pointsUsed", {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
      await ensureColumn("Orders", "pointsDiscount", {
        type: db.Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      });
    }
  } catch (error) {
    console.error("Unable to connect to database:", error);
  }
};

module.exports = connectDB;
