"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      resetToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      resetTokenExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      refreshTokenHash: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      refreshTokenExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      role: {
        type: Sequelize.ENUM("customer", "admin"),
        defaultValue: "customer",
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      points: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      rank: {
        type: Sequelize.ENUM("Bronze", "Silver", "Gold", "Platinum"),
        defaultValue: "Bronze",
        allowNull: false,
      },
      googleId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      provider: {
        type: Sequelize.STRING,
        defaultValue: "local",
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      verificationToken: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      verificationTokenExpiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
