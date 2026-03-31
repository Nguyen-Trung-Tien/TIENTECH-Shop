"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductAttributeValue extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  ProductAttributeValue.init(
    {
      productId: { type: DataTypes.INTEGER, allowNull: false },
      attributeValueId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "ProductAttributeValue",
      tableName: "ProductAttributeValues",
      timestamps: true,
    }
  );

  return ProductAttributeValue;
};
