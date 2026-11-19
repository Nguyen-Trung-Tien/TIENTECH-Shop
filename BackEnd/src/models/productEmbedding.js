"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ProductEmbedding extends Model {
    static associate(models) {
      ProductEmbedding.belongsTo(models.Product, {
        foreignKey: "productId",
        as: "product",
      });
    }
  }

  ProductEmbedding.init(
    {
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      model: {
        type: DataTypes.STRING(80),
        allowNull: false,
        defaultValue: "gemini-embedding-2",
      },
      dimensions: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 768,
      },
      vector: {
        type: DataTypes.BLOB,
        allowNull: true,
      },
      contentHash: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "ready", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      indexedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ProductEmbedding",
      tableName: "ProductEmbeddings",
      timestamps: true,
      indexes: [
        { fields: ["status"], name: "idx_product_embeddings_status" },
        { fields: ["model"], name: "idx_product_embeddings_model" },
      ],
    },
  );

  return ProductEmbedding;
};
