"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Order, {
        foreignKey: "orderId",
        as: "order",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      Payment.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }
  }

  Payment.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      method: {
        type: DataTypes.ENUM("cod", "bank", "paypal", "momo", "vnpay"),
        allowNull: false,
        defaultValue: "cod",
      },
      status: {
        type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
        defaultValue: "pending",
      },
      paymentDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      transactionId: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "Payments",
      timestamps: true,
    }
  );

  return Payment;
};
