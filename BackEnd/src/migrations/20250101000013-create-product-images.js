"use strict";
const { createTableIfNotExists, dropTableIfExists } = require("../utils/migrationHelper");


module.exports = {
  async up(queryInterface, Sequelize) {
    await createTableIfNotExists(queryInterface, "ProductImages", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      imageUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      publicId: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      isPrimary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //   model: "Products",
        //   key: "id",
        // },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await dropTableIfExists(queryInterface, "ProductImages");
  },
};
