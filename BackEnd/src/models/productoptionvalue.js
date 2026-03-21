"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductOptionValue extends Model {
    static associate(models) {
      ProductOptionValue.belongsTo(models.ProductOption, { foreignKey: "productOptionId", as: "option" });
      ProductOptionValue.belongsToMany(models.ProductVariant, {
        through: "VariantOptionValues",
        foreignKey: "productOptionValueId",
        as: "variants",
      });
    }
  }

  ProductOptionValue.init(
    {
      value: { type: DataTypes.STRING, allowNull: false }, // e.g., Red, Blue, XL
      productOptionId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "ProductOptionValue",
      tableName: "ProductOptionValues",
    }
  );

  return ProductOptionValue;
};
