"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Thêm cột cancelReason
    await queryInterface.addColumn("Orders", "cancelReason", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    // 2. Cập nhật ENUM cho trường status
    // Lưu ý: Với MySQL, ta cần dùng query raw để thay đổi ENUM an toàn
    await queryInterface.sequelize.query(`
      ALTER TABLE Orders 
      MODIFY COLUMN status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'cancel_requested') 
      DEFAULT 'pending'
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Xóa cột cancelReason
    await queryInterface.removeColumn("Orders", "cancelReason");

    // 2. Đưa ENUM về trạng thái cũ
    await queryInterface.sequelize.query(`
      ALTER TABLE Orders 
      MODIFY COLUMN status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') 
      DEFAULT 'pending'
    `);
  },
};
