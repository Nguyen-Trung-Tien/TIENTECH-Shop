"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      Review.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });

      Review.hasMany(models.ReviewReply, { 
        foreignKey: "reviewId",
        as: "replies" 
      });

      Review.hasMany(models.ReviewImage, {
        foreignKey: "reviewId",
        as: "images",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Review.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Review",
      tableName: "Reviews",
      timestamps: true,
    }
  );

  return Review;
};
