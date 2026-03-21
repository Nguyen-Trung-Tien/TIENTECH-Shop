"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductOption extends Model {
    static associate(models) {
      ProductOption.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
      ProductOption.hasMany(models.ProductOptionValue, { foreignKey: "productOptionId", as: "values" });
    }
  }

  ProductOption.init(
    {
      name: { type: DataTypes.STRING, allowNull: false }, // e.g., Color, Size
      productId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "ProductOption",
      tableName: "ProductOptions",
    }
  );

  return ProductOption;
};
