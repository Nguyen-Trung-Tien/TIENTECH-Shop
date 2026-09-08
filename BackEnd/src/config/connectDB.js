const { Sequelize } = require("sequelize");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const db = require("../models");

let connectDB = async () => {
  try {
    await db.sequelize.authenticate();
    console.log(`Database connected successfully (${isProduction ? 'Production' : 'Development'})`);
  } catch (error) {
    console.error("Unable to connect to database:", error);
  }
};

module.exports = connectDB;
