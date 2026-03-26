"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Wishlists", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Products", key: "id" },
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
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
    
    // Check if constraint exists before adding (standard way for MySQL is to just try/catch if no direct check exists in queryInterface for older versions)
    try {
      await queryInterface.addConstraint("Wishlists", {
        fields: ["userId", "productId"],
        type: "unique",
        name: "unique_wishlist_user_product",
      });
    } catch (error) {
      console.log("Constraint 'unique_wishlist_user_product' already exists or could not be added.");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Wishlists");
  },
};
