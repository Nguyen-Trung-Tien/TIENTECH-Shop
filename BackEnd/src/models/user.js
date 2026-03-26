"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Order, {
        foreignKey: "userId",
        as: "orders",
        onDelete: "CASCADE",
      });
      User.hasOne(models.Cart, {
        foreignKey: "userId",
        as: "cart",
        onDelete: "CASCADE",
      });
      User.hasMany(models.Review, {
        foreignKey: "userId",
        as: "reviews",
        onDelete: "CASCADE",
      });

      User.hasMany(models.ReviewReply, {
        foreignKey: "userId",
        as: "reviewReplies",
        onDelete: "CASCADE",
      });

      User.hasMany(models.Payment, {
        foreignKey: "userId",
        as: "payments",
        onDelete: "SET NULL",
      });
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { len: [3, 50] },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      phone: { type: DataTypes.STRING, allowNull: true },
      address: { type: DataTypes.STRING, allowNull: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM("customer", "admin"),
        defaultValue: "customer",
      },
      avatar: { type: DataTypes.STRING, allowNull: true },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      refreshTokenHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      refreshTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      verificationTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      timestamps: true,
    }
  );

  return User;
};
