"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Orders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      orderCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        // references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      totalPrice: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.0,
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "confirmed", // khách xác nhận đơn
          "processing",
          "shipped",
          "delivered",
          "cancelled", // khách hủy đơn
        ),
        defaultValue: "pending",
      },
      confirmationHistory: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],
        comment: "Lịch sử xác nhận/hủy đơn hàng",
      },
      shippingAddress: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      paymentMethod: {
        type: Sequelize.ENUM("cod", "bank", "paypal", "momo", "vnpay"),
        defaultValue: "cod",
      },
      paymentStatus: {
        type: Sequelize.ENUM("unpaid", "paid", "refunded"),
        defaultValue: "unpaid",
      },
      orderDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      note: {
        type: Sequelize.TEXT,
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
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Orders");
  },
};
