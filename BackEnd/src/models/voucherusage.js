"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class VoucherUsage extends Model {
    static associate(models) {
      VoucherUsage.belongsTo(models.Voucher, {
        foreignKey: "voucherId",
        as: "voucher",
      });
      VoucherUsage.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      VoucherUsage.belongsTo(models.Order, {
        foreignKey: "orderId",
        as: "order",
      });
    }
  }

  VoucherUsage.init(
    {
      voucherId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      discountAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("applied", "used", "cancelled"),
        defaultValue: "used",
      },
    },
    {
      sequelize,
      modelName: "VoucherUsage",
      tableName: "VoucherUsages",
      timestamps: true,
    },
  );

  return VoucherUsage;
};
