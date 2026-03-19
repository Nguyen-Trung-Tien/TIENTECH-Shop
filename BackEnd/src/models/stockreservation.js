"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class StockReservation extends Model {
    static associate(models) {
      StockReservation.belongsTo(models.Order, {
        foreignKey: "orderId",
        as: "order",
      });
      StockReservation.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
      });
    }
  }
  StockReservation.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("reserved", "committed", "released"),
        defaultValue: "reserved",
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "StockReservation",
      tableName: "StockReservations",
      timestamps: true,
    },
  );
  return StockReservation;
};
