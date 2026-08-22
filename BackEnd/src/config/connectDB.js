const { Sequelize } = require("sequelize");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const sequelize = new Sequelize(
  process.env.DB_DATABASE_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || "mysql",
    logging: false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || (isProduction ? "10" : "5"), 10),
      min: parseInt(process.env.DB_POOL_MIN || "0", 10),
      acquire: 30000,
      idle: 10000,
    },

    dialectOptions: isProduction
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  },
);

const db = require("../models");

let connectDB = async () => {
  try {
    await db.sequelize.authenticate();
    console.log(`Database connected successfully (${isProduction ? 'Production' : 'Development'})`);
    if (!isProduction) {
      await db.sequelize.sync();
      console.log("Database models synchronized successfully.");
    }

    // Auto-migrate new columns safely if not yet created in table
    try {
      const queryInterface = db.sequelize.getQueryInterface();
      const userTableDesc = await queryInterface.describeTable("Users");
      if (!userTableDesc.receiveEmail) {
        console.log("[DB Migration] Adding missing 'receiveEmail' column to Users table...");
        await queryInterface.addColumn("Users", "receiveEmail", {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        });
        console.log("[DB Migration] 'receiveEmail' column added successfully.");
      }
    } catch (colErr) {
      console.warn("[DB Migration Check]", colErr.message);
    }
  } catch (error) {
    console.error("Unable to connect to database:", error);
  }
};

module.exports = connectDB;
