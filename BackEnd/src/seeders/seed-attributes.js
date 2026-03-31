"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const attributes = [
      {
        name: "RAM",
        code: "ram",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "ROM",
        code: "rom",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Màu sắc",
        code: "color",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Hệ điều hành",
        code: "os",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "CPU",
        code: "cpu",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "GPU",
        code: "gpu",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Màn hình",
        code: "screen",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Tần số quét",
        code: "refresh_rate",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Pin",
        code: "battery",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Attributes", attributes, {});

    const attributeRecords = await queryInterface.sequelize.query(
      `SELECT id, code FROM Attributes;`,
    );

    const attrMap = {};
    attributeRecords[0].forEach((attr) => {
      attrMap[attr.code] = attr.id;
    });

    const attributeValues = [
      // RAM
      {
        attributeId: attrMap["ram"],
        value: "4GB",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["ram"],
        value: "8GB",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["ram"],
        value: "12GB",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["ram"],
        value: "16GB",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["ram"],
        value: "24GB",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["ram"],
        value: "32GB",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["ram"],
        value: "64GB",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // ROM
      {
        attributeId: attrMap["rom"],
        value: "64GB",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["rom"],
        value: "128GB",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["rom"],
        value: "256GB",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["rom"],
        value: "512GB",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["rom"],
        value: "1TB",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Color
      {
        attributeId: attrMap["color"],
        value: "Đen",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["color"],
        value: "Trắng",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["color"],
        value: "Xanh dương",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["color"],
        value: "Vàng",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["color"],
        value: "Bạc",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["color"],
        value: "Nâu",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["color"],
        value: "Hồng",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["color"],
        value: "Lá",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["color"],
        value: "Hóa",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["color"],
        value: "Xanh lạc",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // OS
      {
        attributeId: attrMap["os"],
        value: "Android 13",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["os"],
        value: "Android 14",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["os"],
        value: "IOS 16",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["os"],
        value: "IOS 17",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["os"],
        value: "HyperOS",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Screen
      {
        attributeId: attrMap["screen"],
        value: "6.0Inch",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["screen"],
        value: "6.3Inch",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["screen"],
        value: "6.5Inch",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["screen"],
        value: "6.7Inch",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["screen"],
        value: "7.0Inch",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["screen"],
        value: "10.0Inch",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["screen"],
        value: "12.0Inch",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Refresh Rate
      {
        attributeId: attrMap["refresh_rate"],
        value: "60Hz",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["refresh_rate"],
        value: "90Hz",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["refresh_rate"],
        value: "120Hz",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["refresh_rate"],
        value: "144Hz",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      // Battery
      {
        attributeId: attrMap["battery"],
        value: "3000mAh",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["battery"],
        value: "4000mAh",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["battery"],
        value: "5000mAh",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        attributeId: attrMap["battery"],
        value: "6000mAh",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("AttributeValues", attributeValues, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("AttributeValues", null, {});
    await queryInterface.bulkDelete("Attributes", null, {});
  },
};
