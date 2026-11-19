"use strict";
const {
  tableExists,
  columnExists,
  addColumnIfNotExists,
  changeColumnIfExists,
} = require("../utils/migrationHelper");

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Users: allow 'root' role & nullable password for OAuth users
    await changeColumnIfExists(queryInterface, "Users", "role", {
      type: Sequelize.ENUM("customer", "admin", "root"),
      defaultValue: "customer",
    });
    await changeColumnIfExists(queryInterface, "Users", "password", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. Products: embedding & review aggregate columns
    await addColumnIfNotExists(queryInterface, "Products", "embedding", {
      type: Sequelize.TEXT("long"),
      allowNull: true,
    });
    await addColumnIfNotExists(queryInterface, "Products", "ratingAvg", {
      type: Sequelize.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0,
    });
    await addColumnIfNotExists(queryInterface, "Products", "reviewCount", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // 3. Vouchers: reconcile expiryDate -> startDate/endDate & ensure all Voucher model columns exist
    if (await tableExists(queryInterface, "Vouchers")) {
      await addColumnIfNotExists(queryInterface, "Vouchers", "name", {
        type: Sequelize.STRING,
        allowNull: true,
      });
      await addColumnIfNotExists(queryInterface, "Vouchers", "minOrderValue", {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
      });
      await addColumnIfNotExists(queryInterface, "Vouchers", "maxDiscount", {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
      });
      await addColumnIfNotExists(queryInterface, "Vouchers", "maxUsage", {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      });
      await addColumnIfNotExists(queryInterface, "Vouchers", "perUserUsage", {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      });
      await addColumnIfNotExists(queryInterface, "Vouchers", "usedCount", {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      });
      await addColumnIfNotExists(queryInterface, "Vouchers", "isActive", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      });
      await addColumnIfNotExists(queryInterface, "Vouchers", "startDate", {
        type: Sequelize.DATE,
        allowNull: true,
      });
      await addColumnIfNotExists(queryInterface, "Vouchers", "endDate", {
        type: Sequelize.DATE,
        allowNull: true,
      });

      const hasExpiry = await columnExists(queryInterface, "Vouchers", "expiryDate");
      if (hasExpiry) {
        await queryInterface.sequelize.query(
          "UPDATE Vouchers SET endDate = COALESCE(expiryDate, NOW()) WHERE endDate IS NULL"
        );
        await changeColumnIfExists(queryInterface, "Vouchers", "expiryDate", {
          type: Sequelize.DATE,
          allowNull: true,
        });
      } else {
        await queryInterface.sequelize.query(
          "UPDATE Vouchers SET endDate = NOW() WHERE endDate IS NULL"
        );
      }

      await changeColumnIfExists(queryInterface, "Vouchers", "endDate", {
        type: Sequelize.DATE,
        allowNull: false,
      });
    }

    // 4. Orders: missing cancelReason, receiverName, receiverPhone, voucherCode, discountAmount
    await addColumnIfNotExists(queryInterface, "Orders", "cancelReason", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await addColumnIfNotExists(queryInterface, "Orders", "receiverName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumnIfNotExists(queryInterface, "Orders", "receiverPhone", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumnIfNotExists(queryInterface, "Orders", "voucherCode", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await addColumnIfNotExists(queryInterface, "Orders", "discountAmount", {
      type: Sequelize.DECIMAL(15, 2),
      defaultValue: 0,
    });

    // 5. Reviews: likes counter
    await addColumnIfNotExists(queryInterface, "Reviews", "likes", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    // 6. CartItems: variantId FK
    await addColumnIfNotExists(queryInterface, "CartItems", "variantId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "ProductVariants", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // 7. OrderItems: variantId FK
    await addColumnIfNotExists(queryInterface, "OrderItems", "variantId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "ProductVariants", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // 8. ProductImages: variantId FK
    await addColumnIfNotExists(queryInterface, "ProductImages", "variantId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "ProductVariants", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // 9. ProductVariants: specifications JSON
    await addColumnIfNotExists(queryInterface, "ProductVariants", "specifications", {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down() {
    // Non-destructive drift-reconciliation migration: keep columns intact on down to prevent production data loss.
  },
};
