"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    static associate(models) {
      AuditLog.belongsTo(models.User, { foreignKey: "adminId", as: "admin" });
      AuditLog.belongsTo(models.User, { foreignKey: "targetUserId", as: "targetUser" });
    }
  }

  AuditLog.init(
    {
      adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      targetUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      previousState: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      newState: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "SUCCESS",
      },
      reason: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userAgent: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "AuditLog",
      tableName: "AuditLogs",
      timestamps: true,
    }
  );

  return AuditLog;
};
