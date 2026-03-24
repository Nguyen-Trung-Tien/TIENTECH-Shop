"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Helper to change column to DECIMAL(15, 2) safely
    const updatePrecision = async (tableName, columnName, allowNull = true, defaultValue = undefined) => {
      const tableInfo = await queryInterface.describeTable(tableName);
      if (tableInfo[columnName]) {
        const options = {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: allowNull,
        };
        
        // Only include defaultValue if it's explicitly provided
        if (defaultValue !== undefined) {
          options.defaultValue = defaultValue;
        }
        
        await queryInterface.changeColumn(tableName, columnName, options);
      }
    };

    // 1. Orders
    await updatePrecision("Orders", "totalPrice", false, 0);
    await updatePrecision("Orders", "discountAmount", true, 0);

    // 2. OrderItems
    await updatePrecision("OrderItems", "price", false, 0);
    await updatePrecision("OrderItems", "subtotal", false, 0);

    // 3. Products
    await updatePrecision("Products", "basePrice", false, 0);
    await updatePrecision("Products", "flashSalePrice", true);

    // 4. ProductVariants
    await updatePrecision("ProductVariants", "price", false, 0);
    await updatePrecision("ProductVariants", "salePrice", true);

    // 5. Payments
    await updatePrecision("Payments", "amount", false, 0);

    // 6. Vouchers
    await updatePrecision("Vouchers", "discountValue", false, 0);
    await updatePrecision("Vouchers", "minOrderValue", true, 0);
    await updatePrecision("Vouchers", "maxDiscount", true);

    // 7. VoucherUsages
    await updatePrecision("VoucherUsages", "discountAmount", false, 0);
  },

  async down(queryInterface, Sequelize) {
    // No rollback logic needed for precision increase
  },
};
