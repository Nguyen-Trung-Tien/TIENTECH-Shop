"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class VariantOptionValue extends Model {
    static associate(models) {}
  }

  VariantOptionValue.init(
    {
      variantId: { type: DataTypes.INTEGER, allowNull: false },
      productOptionValueId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "VariantOptionValue",
      tableName: "VariantOptionValues",
    }
  );

  return VariantOptionValue;
};
