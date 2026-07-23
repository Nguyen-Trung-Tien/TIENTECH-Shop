const db = require("../models");
const { Op } = require("sequelize");

/**
 * Lấy hoặc tạo mới giá trị thuộc tính (Hỗ trợ logic Select or Input)
 */
const getOrCreateAttributeValue = async (attributeCodeOrName, value, transaction) => {
  if (!value) return null;

  const trimmedKey = String(attributeCodeOrName).trim();
  const trimmedVal = String(value).trim();
  if (!trimmedKey || !trimmedVal) return null;

  // Tim thuoc tinh theo code HOAC name
  let attribute = await db.Attribute.findOne({ 
    where: { 
      [Op.or]: [
        { code: trimmedKey.toLowerCase() },
        { name: trimmedKey }
      ]
    },
    transaction 
  });
  
  // Neu chua co trong DB thi tu dong tao moi Attribute
  if (!attribute) {
    const newCode = trimmedKey
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "_");

    const [createdAttr] = await db.Attribute.findOrCreate({
      where: { code: newCode },
      defaults: { name: trimmedKey, code: newCode },
      transaction,
    });
    attribute = createdAttr;
  }

  const [attrValue] = await db.AttributeValue.findOrCreate({
    where: { 
      attributeId: attribute.id, 
      value: trimmedVal 
    },
    transaction
  });

  return attrValue;
};

/**
 * Gán danh sách thuộc tính cho Sản phẩm
 */
const assignAttributesToProduct = async (productId, attributes, transaction) => {
  if (!attributes || typeof attributes !== 'object') return;

  // Xóa các thuộc tính cũ nếu cần (tùy logic update)
  // await db.ProductAttributeValue.destroy({ where: { productId }, transaction });

  for (const [code, value] of Object.entries(attributes)) {
    const attrValue = await getOrCreateAttributeValue(code, value, transaction);
    if (attrValue) {
      await db.ProductAttributeValue.findOrCreate({
        where: { 
          productId, 
          attributeValueId: attrValue.id 
        },
        transaction
      });
    }
  }
};

/**
 * Gán danh sách thuộc tính cho Biến thể (Variant)
 */
const assignAttributesToVariant = async (variantId, attributes, transaction) => {
  if (!attributes || typeof attributes !== 'object') return;

  for (const [code, value] of Object.entries(attributes)) {
    const attrValue = await getOrCreateAttributeValue(code, value, transaction);
    if (attrValue) {
      await db.VariantAttributeValue.findOrCreate({
        where: { 
          variantId, 
          attributeValueId: attrValue.id 
        },
        transaction
      });
    }
  }
};

/**
 * Lấy tất cả Attributes và Values để hiển thị ở Dropdown Admin
 */
const getAllAttributesForAdmin = async () => {
  try {
    const data = await db.Attribute.findAll({
      include: [
        {
          model: db.AttributeValue,
          as: "values",
          attributes: ["id", "value"],
        },
      ],
      attributes: ["id", "name", "code"],
    });
    return { errCode: 0, data };
  } catch (error) {
    return { errCode: 1, errMessage: error.message };
  }
};

module.exports = {
  getOrCreateAttributeValue,
  assignAttributesToProduct,
  assignAttributesToVariant,
  getAllAttributesForAdmin
};
