"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Vouchers", "perUserUsage", {
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: false,
      comment: "Số lượt mỗi user có thể dùng",
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Vouchers", "perUserUsage");
  },
};
