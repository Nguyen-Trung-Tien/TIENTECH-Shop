"use strict";
const { addColumnIfNotExists, removeColumnIfExists } = require("../utils/migrationHelper");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await addColumnIfNotExists(queryInterface, "Notifications", "metadata", {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "Dữ liệu cấu trúc mở rộng (orderCode, actions, thumbnail, voucherCode)",
    });
  },

  down: async (queryInterface) => {
    await removeColumnIfExists(queryInterface, "Notifications", "metadata");
  },
};

