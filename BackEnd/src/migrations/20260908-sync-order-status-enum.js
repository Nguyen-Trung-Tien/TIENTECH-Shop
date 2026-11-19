"use strict";
const { changeColumnIfExists } = require("../utils/migrationHelper");

module.exports = {
  async up(queryInterface, Sequelize) {
    await changeColumnIfExists(queryInterface, "Orders", "status", {
      type: Sequelize.ENUM(
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "shipping",
        "delivered",
        "completed",
        "cancelled",
        "cancel_requested"
      ),
      defaultValue: "pending",
    });
  },

  async down(queryInterface, Sequelize) {
    await changeColumnIfExists(queryInterface, "Orders", "status", {
      type: Sequelize.ENUM(
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "completed",
        "cancelled",
        "cancel_requested"
      ),
      defaultValue: "pending",
    });
  },
};
