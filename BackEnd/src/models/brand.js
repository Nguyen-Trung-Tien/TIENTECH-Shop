"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Brand extends Model {
    static associate(models) {
      // Một Brand có nhiều Product
      Brand.hasMany(models.Product, {
        foreignKey: "brandId",
        as: "products",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });
    }
  }

  Brand.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
      image: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Brand",
      tableName: "Brands",
      timestamps: true,
    },
  );

  return Brand;
};
