"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // MySQL requires raw query to update ENUM values effectively in some versions,
    // but changeColumn is the Sequelize way. 
    // We add 'completed' and 'cancel_requested' if they were missing.
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
