"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Notifications", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "null nếu là thông báo hệ thống gửi cho tất cả hoặc gửi cho Admin",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("order", "promotion", "system"),
        defaultValue: "system",
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      link: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Đường dẫn khi click vào thông báo",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Notifications");
  },
};
