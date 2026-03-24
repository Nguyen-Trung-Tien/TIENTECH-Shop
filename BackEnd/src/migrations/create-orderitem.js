"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("OrderItems", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: { model: "Orders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        // references: { model: "Products", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      quantity: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      price: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      subtotal: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
      productName: { type: Sequelize.STRING, allowNull: false },
      image: { type: Sequelize.BLOB("long"), allowNull: true },

      returnStatus: {
        type: Sequelize.ENUM(
          "none", // chưa yêu cầu trả
          "requested", // khách yêu cầu trả
          "approved", // admin chấp nhận
          "rejected", // admin từ chối
          "completed", // hoàn tất trả hàng
        ),
        defaultValue: "none",
      },
      returnReason: { type: Sequelize.TEXT, allowNull: true },
      returnRequestedAt: { type: Sequelize.DATE, allowNull: true },
      returnProcessedAt: { type: Sequelize.DATE, allowNull: true },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("OrderItems");
  },
};
