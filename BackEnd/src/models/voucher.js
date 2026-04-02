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
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM("percentage", "fixed"),
        defaultValue: "percentage",
      },
      value: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      minOrderValue: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
      },
      maxDiscount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
      },

      maxUsage: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      perUserUsage: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      usedCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      endDate: {
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
