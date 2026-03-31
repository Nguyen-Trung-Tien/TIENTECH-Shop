"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Attribute extends Model {
    static associate(models) {
      Attribute.hasMany(models.AttributeValue, { foreignKey: "attributeId", as: "values" });
    }
  }

  Attribute.init(
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true }, // "RAM", "ROM", "Màu sắc", "CPU", "GPU", "OS", "Màn hình", "Tần số quét"
      code: { type: DataTypes.STRING, unique: true }, // "ram", "rom", "color", "cpu", "gpu", "os", "screen", "refresh_rate"
    },
    {
      sequelize,
      modelName: "Attribute",
      tableName: "Attributes",
      timestamps: true,
    }
  );

  return Attribute;
};
