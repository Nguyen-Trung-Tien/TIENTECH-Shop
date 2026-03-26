"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "verificationToken", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Users", "verificationTokenExpiresAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });
    // Change default of isActive to false for new users
    await queryInterface.changeColumn("Users", "isActive", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "verificationToken");
    await queryInterface.removeColumn("Users", "verificationTokenExpiresAt");
    await queryInterface.changeColumn("Users", "isActive", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
  },
};
