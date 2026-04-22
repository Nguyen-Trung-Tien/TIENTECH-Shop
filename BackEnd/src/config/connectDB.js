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
    timezone: "+07:00",

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

let connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connected successfully (${isProduction ? 'Production' : 'Development'})`);
  } catch (error) {
    console.error("Unable to connect to database:", error);
  }
};

module.exports = connectDB;
