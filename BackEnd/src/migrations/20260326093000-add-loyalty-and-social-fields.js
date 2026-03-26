"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "points", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
    await queryInterface.addColumn("Users", "rank", {
      type: Sequelize.ENUM("Bronze", "Silver", "Gold", "Platinum"),
      defaultValue: "Bronze",
      allowNull: false,
    });
    await queryInterface.addColumn("Users", "googleId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn("Users", "provider", {
      type: Sequelize.STRING,
      defaultValue: "local",
      allowNull: false,
    });
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "points");
    await queryInterface.removeColumn("Users", "rank");
    // For ENUM types in MySQL, sometimes removeColumn works, sometimes we need to drop the type if it's PostgreSQL.
    // In MySQL, it's just a column.
    await queryInterface.removeColumn("Users", "googleId");
    await queryInterface.removeColumn("Users", "provider");
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
