"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Products", "isFlashSale", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("Products", "flashSalePrice", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn("Products", "flashSaleStart", {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn("Products", "flashSaleEnd", {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Products", "isFlashSale");
    await queryInterface.removeColumn("Products", "flashSalePrice");
    await queryInterface.removeColumn("Products", "flashSaleStart");
    await queryInterface.removeColumn("Products", "flashSaleEnd");
  },
};
