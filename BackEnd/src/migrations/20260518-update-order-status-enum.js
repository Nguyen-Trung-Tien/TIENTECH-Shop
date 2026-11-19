"use strict";
const { tableExists } = require("../utils/migrationHelper");

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await tableExists(queryInterface, "Orders"))) return;
    const desc = await queryInterface.describeTable("Orders");
    const statusType = String(desc?.status?.type || "").toLowerCase();
    if (statusType.includes("cancel_requested") && statusType.includes("completed")) {
      return;
    }

    await queryInterface.changeColumn("Orders", "status", {
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

  async down(queryInterface, Sequelize) {
    if (!(await tableExists(queryInterface, "Orders"))) return;
    await queryInterface.changeColumn("Orders", "status", {
      type: Sequelize.ENUM(
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
      ),
      defaultValue: "pending",
    });
  },
};
