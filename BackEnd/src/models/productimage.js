"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductImage extends Model {
    static associate(models) {
      ProductImage.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
        onDelete: "CASCADE",
      });
      ProductImage.belongsTo(models.ProductVariant, {
        foreignKey: "variantId",
        as: "variant",
        onDelete: "SET NULL",
      });
    }
  }

  ProductImage.init(
    {
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      publicId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isPrimary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      
      // Mới: Một tấm ảnh có thể thuộc về 1 biến thể (VD: 1 màu cụ thể)
      variantId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ProductImage",
      tableName: "ProductImages",
      timestamps: true,
    }
  );

  return ProductImage;
};
