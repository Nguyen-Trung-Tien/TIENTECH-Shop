"use strict";
const { addColumnIfNotExists, removeColumnIfExists } = require("../utils/migrationHelper");

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfNotExists(queryInterface, "Users", "receiveEmail", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await removeColumnIfExists(queryInterface, "Users", "receiveEmail");
  },
};
