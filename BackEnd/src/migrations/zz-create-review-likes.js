"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ReviewLikes", {
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
      reviewId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Reviews", key: "id" },
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

    try {
      await queryInterface.addConstraint("ReviewLikes", {
        fields: ["userId", "reviewId"],
        type: "unique",
        name: "unique_review_user_like",
      });
    } catch (error) {
      console.log("Constraint 'unique_review_user_like' already exists or could not be added.");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ReviewLikes");
  },
};
