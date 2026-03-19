"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    }
  }

  Notification.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("order", "promotion", "system"),
        defaultValue: "system",
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "Notifications",
      timestamps: true,
    }
  );

  return Notification;
};
