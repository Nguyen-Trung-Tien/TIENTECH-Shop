"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Orders", "voucherCode", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Orders", "discountAmount", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Orders", "voucherCode");
    await queryInterface.removeColumn("Orders", "discountAmount");
  },
};