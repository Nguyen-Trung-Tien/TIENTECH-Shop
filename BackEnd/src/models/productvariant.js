"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    static associate(models) {
      ProductVariant.belongsTo(models.Product, { foreignKey: "productId", as: "product" });
      ProductVariant.hasMany(models.OrderItem, { foreignKey: "variantId", as: "orderItems" });
      ProductVariant.hasMany(models.CartItem, { foreignKey: "variantId", as: "cartItems" });
      ProductVariant.hasMany(models.ProductImage, { foreignKey: "variantId", as: "images" });
      ProductVariant.belongsToMany(models.AttributeValue, { 
        through: "VariantAttributeValues", 
        foreignKey: "variantId",
        as: "attributes"
      });
    }
  }

  ProductVariant.init(
    {
      sku: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: false 
      },
      price: { 
        type: DataTypes.DECIMAL(15, 2), 
        allowNull: false 
      },
      
      // Khuyến mãi riêng cho biến thể
      discount: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
      salePrice: { 
        type: DataTypes.DECIMAL(15, 2),
        comment: "Giá sau giảm giá" 
      },
      
      stock: { type: DataTypes.INTEGER, defaultValue: 0 },
      
      // VD: {Color: 'Gold', Storage: '256GB'}
      attributeValues: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {}
      },

      specifications: { 
        type: DataTypes.JSON, 
        defaultValue: {},
        comment: "Variant-specific technical specs"
      },
      
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
      productId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "ProductVariant",
      tableName: "ProductVariants",
      timestamps: true,
      hooks: {
        beforeSave: (variant) => {
          if (variant.discount > 0) {
            variant.salePrice = variant.price * (1 - variant.discount / 100);
          } else {
            variant.salePrice = variant.price;
          }
        }
      }
    }
  );

  return ProductVariant;
};
