"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tableDesc = await queryInterface.describeTable("Users");
      if (!tableDesc.receiveEmail) {
        await queryInterface.addColumn("Users", "receiveEmail", {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        });
      }
    } catch (e) {
      console.warn("[Migration] add receiveEmail column:", e.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn("Users", "receiveEmail");
    } catch (e) {
      console.warn("[Migration] remove receiveEmail column:", e.message);
    }
  },
};
