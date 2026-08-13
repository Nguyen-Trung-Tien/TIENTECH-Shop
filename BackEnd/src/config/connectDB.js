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
  } catch (error) {
    console.error("Unable to connect to database:", error);
  }
};

module.exports = connectDB;
