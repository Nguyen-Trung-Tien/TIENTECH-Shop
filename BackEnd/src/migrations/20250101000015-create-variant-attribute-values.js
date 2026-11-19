"use strict";
const { createTableIfNotExists, dropTableIfExists } = require("../utils/migrationHelper");


module.exports = {
  async up(queryInterface, Sequelize) {
    await createTableIfNotExists(queryInterface, "VariantAttributeValues", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      variantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //   model: "ProductVariants",
        //   key: "id",
        // },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      attributeValueId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "AttributeValues",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await dropTableIfExists(queryInterface, "VariantAttributeValues");
  },
};
