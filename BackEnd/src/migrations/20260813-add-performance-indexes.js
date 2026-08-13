"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const addIndexSafe = async (table, fields, name) => {
      try {
        await queryInterface.addIndex(table, fields, { name });
        console.log(`Index ${name} added to ${table}`);
      } catch (err) {
        console.log(`Index ${name} might already exist or failed: ${err.message}`);
      }
    };

    // Products table indexes
    await addIndexSafe("Products", ["categoryId", "isActive"], "idx_products_category_active");
    await addIndexSafe("Products", ["brandId", "isActive"], "idx_products_brand_active");
    await addIndexSafe("Products", ["isFlashSale", "flashSaleStart", "flashSaleEnd"], "idx_products_flash_sale");
    await addIndexSafe("Products", ["basePrice"], "idx_products_base_price");
    await addIndexSafe("Products", ["createdAt"], "idx_products_created_at");

    // ProductAttributeValues indexes
    await addIndexSafe("ProductAttributeValues", ["productId", "attributeValueId"], "idx_pav_product_attribute");
    await addIndexSafe("ProductAttributeValues", ["attributeValueId", "productId"], "idx_pav_attribute_product");

    // ProductVariants indexes
    await addIndexSafe("ProductVariants", ["productId"], "idx_pv_product");

    // Reviews indexes
    await addIndexSafe("Reviews", ["productId", "rating"], "idx_reviews_product_rating");

    // Categories & Brands slug indexes
    await addIndexSafe("Categories", ["slug"], "idx_categories_slug");
    await addIndexSafe("Brands", ["slug"], "idx_brands_slug");
  },

  async down(queryInterface, Sequelize) {
    const removeIndexSafe = async (table, name) => {
      try {
        await queryInterface.removeIndex(table, name);
      } catch (err) {}
    };

    await removeIndexSafe("Products", "idx_products_category_active");
    await removeIndexSafe("Products", "idx_products_brand_active");
    await removeIndexSafe("Products", "idx_products_flash_sale");
    await removeIndexSafe("Products", "idx_products_base_price");
    await removeIndexSafe("Products", "idx_products_created_at");
    await removeIndexSafe("ProductAttributeValues", "idx_pav_product_attribute");
    await removeIndexSafe("ProductAttributeValues", "idx_pav_attribute_product");
    await removeIndexSafe("ProductVariants", "idx_pv_product");
    await removeIndexSafe("Reviews", "idx_reviews_product_rating");
    await removeIndexSafe("Categories", "idx_categories_slug");
    await removeIndexSafe("Brands", "idx_brands_slug");
  },
};
