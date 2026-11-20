"use strict";
const {
  addColumnIfNotExists,
  removeColumnIfExists,
  addIndexIfNotExists,
} = require("../utils/migrationHelper");

module.exports = {
  async up(queryInterface, Sequelize) {
    await addColumnIfNotExists(queryInterface, "ContactTickets", "userId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await addIndexIfNotExists(
      queryInterface,
      "ContactTickets",
      ["userId"],
      "idx_contact_tickets_user_id",
    );
  },

  async down(queryInterface) {
    await removeColumnIfExists(queryInterface, "ContactTickets", "userId");
  },
};
