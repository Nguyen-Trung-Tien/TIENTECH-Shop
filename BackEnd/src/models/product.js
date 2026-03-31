"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Category, { foreignKey: "categoryId", as: "category" });
      Product.belongsTo(models.Brand, { foreignKey: "brandId", as: "brand" });
      Product.hasMany(models.ProductImage, { foreignKey: "productId", as: "images" });
      Product.hasMany(models.ProductVariant, { foreignKey: "productId", as: "variants" });
      Product.hasMany(models.Review, { foreignKey: "productId", as: "reviews" });
      Product.hasMany(models.OrderItem, { foreignKey: "productId", as: "orderItems" });
      Product.hasMany(models.Wishlist, { foreignKey: "productId", as: "wishlists" });
      Product.belongsToMany(models.AttributeValue, { 
        through: "ProductAttributeValues", 
        foreignKey: "productId",
        as: "attributes"
      });
    }
  }

  Product.init(
    {
      name: { type: DataTypes.STRING, allowNull: false },
      sku: { type: DataTypes.STRING, unique: true },
      slug: { type: DataTypes.STRING, unique: true },
      description: { type: DataTypes.TEXT },
      specifications: { 
        type: DataTypes.JSON, 
        defaultValue: {},
      },
      basePrice: { 
        type: DataTypes.DECIMAL(15, 2), 
        allowNull: false, 
        defaultValue: 0 
      },
      totalStock: { type: DataTypes.INTEGER, defaultValue: 0 },
      sold: { type: DataTypes.INTEGER, defaultValue: 0 },
      hasVariants: { type: DataTypes.BOOLEAN, defaultValue: false },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      brandId: { type: DataTypes.INTEGER },
      categoryId: { type: DataTypes.INTEGER },
      isFlashSale: { type: DataTypes.BOOLEAN, defaultValue: false },
      flashSalePrice: { type: DataTypes.DECIMAL(15, 2) },
      flashSaleStart: { type: DataTypes.DATE },
      flashSaleEnd: { type: DataTypes.DATE },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "Products",
      timestamps: true,
      indexes: [
        { unique: true, fields: ["slug"] },
        { fields: ["brandId"] },
        { fields: ["categoryId"] },
        { fields: ["isActive"] }
      ]
    }
  );

  return Product;
};
