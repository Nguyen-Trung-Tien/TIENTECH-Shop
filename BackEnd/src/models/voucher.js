"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Voucher extends Model {
    static associate(models) {
      // Voucher can be applied to many orders
    }
  }

  Voucher.init(
    {
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.ENUM("percentage", "fixed"),
        defaultValue: "percentage",
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      minOrderValue: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      maxDiscount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      maxUsage: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      usedCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Voucher",
      tableName: "Vouchers",
      timestamps: true,
    }
  );

  return Voucher;
};
