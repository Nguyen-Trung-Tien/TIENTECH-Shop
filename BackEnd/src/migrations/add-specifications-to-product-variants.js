"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("ProductVariants");
    if (!tableInfo.specifications) {
      await queryInterface.addColumn("ProductVariants", "specifications", {
        type: Sequelize.JSON,
        defaultValue: {},
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("ProductVariants", "specifications");
  },
};
