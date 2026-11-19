"use strict";
const {
  createTableIfNotExists,
  dropTableIfExists,
  addIndexIfNotExists,
  removeIndexIfExists,
} = require("../utils/migrationHelper");

module.exports = {
  async up(queryInterface, Sequelize) {
    await createTableIfNotExists(queryInterface, "ProductEmbeddings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      model: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: "gemini-embedding-2",
      },
      dimensions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 768,
      },
      vector: {
        type: Sequelize.BLOB,
        allowNull: true,
      },
      contentHash: {
        type: Sequelize.STRING(64),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("pending", "ready", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      indexedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await addIndexIfNotExists(queryInterface, "ProductEmbeddings", ["status"], {
      name: "idx_product_embeddings_status",
    });
    await addIndexIfNotExists(queryInterface, "ProductEmbeddings", ["model"], {
      name: "idx_product_embeddings_model",
    });

    try {
      await addIndexIfNotExists(
        queryInterface,
        "Products",
        ["name", "description"],
        {
          type: "FULLTEXT",
          name: "ft_products_name_description",
        },
      );
    } catch (err) {
      console.warn(
        "[Migration] Skipping FULLTEXT index ft_products_name_description:",
        err?.message,
      );
    }
  },

  async down(queryInterface) {
    try {
      await removeIndexIfExists(
        queryInterface,
        "Products",
        "ft_products_name_description",
      );
    } catch {
      // Ignore if FULLTEXT index does not exist
    }
    await dropTableIfExists(queryInterface, "ProductEmbeddings");
  },
};
