"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    static associate(models) {
      Wishlist.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      Wishlist.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
    }
  }

  Wishlist.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Wishlist",
      tableName: "Wishlists",
      timestamps: true,
    }
  );

  return Wishlist;
};
