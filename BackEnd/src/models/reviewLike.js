"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ReviewLike extends Model {
    static associate(models) {
      ReviewLike.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      ReviewLike.belongsTo(models.Review, { foreignKey: "reviewId", as: "review" });
    }
  }

  ReviewLike.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reviewId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ReviewLike",
      tableName: "ReviewLikes",
      timestamps: true,
    }
  );

  return ReviewLike;
};
