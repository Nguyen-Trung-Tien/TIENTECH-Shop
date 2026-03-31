"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class VariantAttributeValue extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  VariantAttributeValue.init(
    {
      variantId: { type: DataTypes.INTEGER, allowNull: false },
      attributeValueId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "VariantAttributeValue",
      tableName: "VariantAttributeValues",
      timestamps: true,
    }
  );

  return VariantAttributeValue;
};
