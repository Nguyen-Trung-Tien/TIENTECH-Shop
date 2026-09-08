"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addIndex("Payments", ["orderId"], {
        unique: true,
        name: "payments_order_id_unique",
      });
    } catch (e) {
      console.warn("[Migration] payments_order_id_unique:", e.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeIndex("Payments", "payments_order_id_unique");
    } catch (e) {
      console.warn("[Migration] remove payments_order_id_unique:", e.message);
    }
  },
};
