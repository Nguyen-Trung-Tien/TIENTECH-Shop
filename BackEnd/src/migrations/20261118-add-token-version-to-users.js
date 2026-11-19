"use strict";
const { addColumnIfNotExists, removeColumnIfExists } = require("../utils/migrationHelper");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await addColumnIfNotExists(queryInterface, "Users", "tokenVersion", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  down: async (queryInterface) => {
    await removeColumnIfExists(queryInterface, "Users", "tokenVersion");
  },
};
