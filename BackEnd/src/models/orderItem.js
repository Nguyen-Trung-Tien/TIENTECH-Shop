"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      // Mỗi OrderItem thuộc về 1 Order
      OrderItem.belongsTo(models.Order, {
        foreignKey: "orderId",
        as: "order",
        onDelete: "CASCADE",
      });

      // Mỗi OrderItem thuộc về 1 Product
      OrderItem.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
        onDelete: "SET NULL",
      });
      OrderItem.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "productInfo",
        onDelete: "SET NULL",
      });
      OrderItem.belongsTo(models.ProductVariant, {
        foreignKey: "variantId",
        as: "variant",
        onDelete: "SET NULL",
      });
    }
  }

  OrderItem.init(
    {
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      productName: { type: DataTypes.STRING, allowNull: false },
      image: { type: DataTypes.BLOB("long"), allowNull: true },
      variantId: { type: DataTypes.INTEGER, allowNull: true },
      returnStatus: {
        type: DataTypes.ENUM(
          "none", // chưa yêu cầu trả
          "requested", // khách yêu cầu trả
          "approved", // admin chấp nhận
          "rejected", // admin từ chối
          "completed" // hoàn tất trả hàng
        ),
        defaultValue: "none",
      },
      returnReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      returnRequestedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      returnProcessedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "OrderItem",
      tableName: "OrderItems",
      timestamps: true,
    }
  );

  return OrderItem;
};
