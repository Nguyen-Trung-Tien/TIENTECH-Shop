"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("Orders");
    if (!tableInfo.pointsUsed) {
      await queryInterface.addColumn("Orders", "pointsUsed", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
    if (!tableInfo.pointsDiscount) {
      await queryInterface.addColumn("Orders", "pointsDiscount", {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  async down(queryInterface) {
    const tableInfo = await queryInterface.describeTable("Orders");
    if (tableInfo.pointsUsed) {
      await queryInterface.removeColumn("Orders", "pointsUsed");
    }
    if (tableInfo.pointsDiscount) {
      await queryInterface.removeColumn("Orders", "pointsDiscount");
    }
  },
};
