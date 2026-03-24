"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Fix Products Table
    const productTableInfo = await queryInterface.describeTable("Products");
    
    // Remove 'price' if it exists
    if (productTableInfo.price) {
      await queryInterface.removeColumn("Products", "price");
    }
    
    // Remove other old fields if they exist
    const oldProductFields = ["stock", "discount", "image", "color", "ram", "rom", "screen", "cpu", "battery", "weight", "connectivity", "os", "extra"];
    for (const field of oldProductFields) {
      if (productTableInfo[field]) {
        await queryInterface.removeColumn("Products", field);
      }
    }

    // Ensure new fields exist
    if (!productTableInfo.slug) {
      await queryInterface.addColumn("Products", "slug", {
        type: Sequelize.STRING,
        unique: true,
      });
    }
    if (!productTableInfo.specifications) {
      await queryInterface.addColumn("Products", "specifications", {
        type: Sequelize.JSON,
        defaultValue: {},
      });
    }
    if (!productTableInfo.basePrice) {
      await queryInterface.addColumn("Products", "basePrice", {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      });
    }
    if (!productTableInfo.hasVariants) {
      await queryInterface.addColumn("Products", "hasVariants", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });
    }

    // 2. Fix ProductVariants Table
    const variantTableInfo = await queryInterface.describeTable("ProductVariants");

    // Rename 'attributes' to 'attributeValues' if it exists
    if (variantTableInfo.attributes && !variantTableInfo.attributeValues) {
      await queryInterface.renameColumn("ProductVariants", "attributes", "attributeValues");
    } else if (!variantTableInfo.attributeValues) {
      await queryInterface.addColumn("ProductVariants", "attributeValues", {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
      });
    }

    // Add missing fields
    if (!variantTableInfo.discount) {
      await queryInterface.addColumn("ProductVariants", "discount", {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
      });
    }
    if (!variantTableInfo.salePrice) {
      await queryInterface.addColumn("ProductVariants", "salePrice", {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      });
    }

    // Remove old fields
    if (variantTableInfo.imageUrl) {
      await queryInterface.removeColumn("ProductVariants", "imageUrl");
    }
  },

  async down(queryInterface, Sequelize) {
    // Usually no need to revert for a fix-up migration
  },
};
