"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.changeColumn("Orders", "status", {
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
    } catch (e) {
      console.warn("[Migration] sync Order status enum:", e.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
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
    } catch (e) {
      console.warn("[Migration] revert Order status enum:", e.message);
    }
  },
};
