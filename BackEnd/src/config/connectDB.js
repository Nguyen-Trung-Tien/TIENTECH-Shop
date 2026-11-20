require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const db = require("../models");
const { runPendingMigrations } = require("./autoMigrate");

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

    // Auto-run pending migrations on server boot (Render + TiDB Cloud)
    if (!process.env.NODE_ENV || process.env.NODE_ENV !== "test") {
      await runPendingMigrations().catch((mErr) => {
        console.warn("[connectDB] Auto-migration warning:", mErr?.message || mErr);
      });
    }

    // Ensure newly added tables exist in database (TiDB / MySQL) where migrations weren't run
    for (const modelName of ["AuditLog", "ContactTicket", "ProductEmbedding"]) {
      if (db[modelName]) {
        await db[modelName].sync({ alter: false }).catch((err) => {
          console.warn(`[connectDB] ${modelName} auto-sync notice:`, err.message);
        });
      }
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
    if (db.ContactTicket) {
      await ensureColumn("ContactTickets", "userId", {
        type: db.Sequelize.INTEGER,
        allowNull: true,
      });
    }
  } catch (error) {
    console.error("Unable to connect to database:", error);
  }
};

module.exports = connectDB;
