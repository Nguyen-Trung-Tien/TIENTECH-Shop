"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable("Users");
    if (!tableInfo.tokenVersion) {
      await queryInterface.addColumn("Users", "tokenVersion", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  down: async (queryInterface) => {
    const tableInfo = await queryInterface.describeTable("Users");
    if (tableInfo.tokenVersion) {
      await queryInterface.removeColumn("Users", "tokenVersion");
    }
  },
};
