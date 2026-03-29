"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // Category có nhiều Product
      Category.hasMany(models.Product, {
        foreignKey: "categoryId",
        as: "products",
      });

      // Category con thuộc về Category cha (nếu có)
      Category.belongsTo(Category, {
        foreignKey: "parentId",
        as: "parent",
      });

      Category.hasMany(Category, {
        foreignKey: "parentId",
        as: "subcategories",
      });
    }
  }

  Category.init(
    {
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: { type: DataTypes.TEXT },
      image: { type: DataTypes.STRING },
      parentId: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "Categories",
    }
  );

  return Category;
};
