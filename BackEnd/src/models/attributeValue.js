"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AttributeValue extends Model {
    static associate(models) {
      AttributeValue.belongsTo(models.Attribute, { foreignKey: "attributeId", as: "attribute" });
      
      AttributeValue.belongsToMany(models.Product, { 
        through: "ProductAttributeValues", 
        foreignKey: "attributeValueId",
        as: "products"
      });
      
      AttributeValue.belongsToMany(models.ProductVariant, { 
        through: "VariantAttributeValues", 
        foreignKey: "attributeValueId",
        as: "variants"
      });
    }
  }

  AttributeValue.init(
    {
      attributeId: { type: DataTypes.INTEGER, allowNull: false },
      value: { type: DataTypes.STRING, allowNull: false }, // "8GB", "120Hz", "Snapdragon 8 Gen 3"
    },
    {
      sequelize,
      modelName: "AttributeValue",
      tableName: "AttributeValues",
      timestamps: true,
    }
  );

  return AttributeValue;
};
