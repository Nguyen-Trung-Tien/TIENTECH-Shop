"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ReviewImage extends Model {
    static associate(models) {
      ReviewImage.belongsTo(models.Review, {
        foreignKey: "reviewId",
        as: "review",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  ReviewImage.init(
    {
      reviewId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ReviewImage",
      tableName: "ReviewImages",
      timestamps: true,
    }
  );

  return ReviewImage;
};
