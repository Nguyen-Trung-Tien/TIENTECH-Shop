"use strict";
const { createTableIfNotExists, dropTableIfExists } = require("../utils/migrationHelper");


module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await createTableIfNotExists(queryInterface, "SystemSettings", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        key: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        value: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        category: {
          type: Sequelize.STRING,
          defaultValue: "general",
        },
        isPublic: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      });
    } catch (e) {
      console.warn("[Migration] createTable SystemSettings:", e.message);
    }
  },

  async down(queryInterface, _Sequelize) {
    try {
      await dropTableIfExists(queryInterface, "SystemSettings");
    } catch (e) {
      console.warn("[Migration] dropTable SystemSettings:", e.message);
    }
  },
};
