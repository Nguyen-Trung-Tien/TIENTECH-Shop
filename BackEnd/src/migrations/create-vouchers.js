"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Vouchers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: Sequelize.ENUM("percentage", "fixed"), // Giảm theo % hoặc tiền cố định
        defaultValue: "percentage",
      },
      value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      minOrderValue: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      maxDiscount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "Số tiền giảm tối đa nếu dùng percentage",
      },
      maxUsage: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      usedCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable("Vouchers");
  },
};
