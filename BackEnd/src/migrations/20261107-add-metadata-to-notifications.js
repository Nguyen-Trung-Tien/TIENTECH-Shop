"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("Notifications");
    if (!tableInfo.metadata) {
      await queryInterface.addColumn("Notifications", "metadata", {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Dữ liệu cấu trúc mở rộng (orderCode, actions, thumbnail, voucherCode)",
      });
    }
  },

  down: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable("Notifications");
    if (tableInfo.metadata) {
      await queryInterface.removeColumn("Notifications", "metadata");
    }
  },
};

