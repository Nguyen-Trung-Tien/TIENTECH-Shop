"use strict";
const { addColumnIfNotExists, removeColumnIfExists } = require("../utils/migrationHelper");

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfNotExists(queryInterface, "Orders", "pointsUsed", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await addColumnIfNotExists(queryInterface, "Orders", "pointsDiscount", {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await removeColumnIfExists(queryInterface, "Orders", "pointsUsed");
    await removeColumnIfExists(queryInterface, "Orders", "pointsDiscount");
  },
};
