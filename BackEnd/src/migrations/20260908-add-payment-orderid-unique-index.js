"use strict";
const { addIndexIfNotExists, removeIndexIfExists } = require("../utils/migrationHelper");

module.exports = {
  async up(queryInterface) {
    await addIndexIfNotExists(queryInterface, "Payments", ["orderId"], {
      unique: true,
      name: "payments_order_id_unique",
    });
  },

  async down(queryInterface) {
    await removeIndexIfExists(queryInterface, "Payments", "payments_order_id_unique");
  },
};
