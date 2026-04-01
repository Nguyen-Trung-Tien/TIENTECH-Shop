const db = require("../models");
const AttributeService = require("./AttributeService");

const getVariantsByProductId = async (productId) => {
  try {
    const variants = await db.ProductVariant.findAll({
      where: { productId },
      include: [
        { model: db.ProductImage, as: "images", attributes: ["id", "imageUrl", "isPrimary"] },
        { 
          model: db.AttributeValue, 
          as: "attributes", 
          include: [{ model: db.Attribute, as: "attribute" }] 
        }
      ],
      order: [["id", "ASC"]],
      distinct: true
    });
    return { errCode: 0, data: variants };
  } catch (e) {
    console.error("Error getVariantsByProductId:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const createVariant = async (data) => {
  const t = await db.sequelize.transaction();
  try {
    const {
      productId,
      sku,
      price,
      stock,
      isActive = true,
      attributeValues = {},
      attributes = {},
    } = data;

    if (!productId || price == null || stock == null) {
      await t.rollback();
      return { errCode: 2, errMessage: "Missing required fields" };
    }

    const variant = await db.ProductVariant.create({
      productId,
      sku: sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      price,
      stock,
      isActive: !!isActive,
      attributeValues: attributes || attributeValues,
    }, { transaction: t });

    // Gán attributes vào junction table
    const attrsToAssign = attributes && Object.keys(attributes).length > 0 ? attributes : attributeValues;
    if (attrsToAssign && Object.keys(attrsToAssign).length > 0) {
      await AttributeService.assignAttributesToVariant(variant.id, attrsToAssign, t);
    }

    await t.commit();
    
    // Fetch again to include attributes
    const fullVariant = await db.ProductVariant.findByPk(variant.id, {
      include: [
        { model: db.AttributeValue, as: "attributes", include: [{ model: db.Attribute, as: "attribute" }] }
      ]
    });

    return { errCode: 0, data: fullVariant };
  } catch (e) {
    await t.rollback();
    console.error("Error createVariant:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const updateVariant = async (id, data) => {
  const t = await db.sequelize.transaction();
  try {
    const variant = await db.ProductVariant.findByPk(id, { transaction: t });
    if (!variant) {
      await t.rollback();
      return { errCode: 1, errMessage: "Variant not found" };
    }

    const attrsToUpdate = data.attributes || data.attributeValues;

    const updateData = {
      sku: data.sku !== undefined ? data.sku : variant.sku,
      price: data.price !== undefined ? data.price : variant.price,
      stock: data.stock !== undefined ? data.stock : variant.stock,
      isActive: data.isActive !== undefined ? data.isActive : variant.isActive,
      attributeValues: attrsToUpdate !== undefined ? attrsToUpdate : variant.attributeValues,
    };

    await variant.update(updateData, { transaction: t });

    if (attrsToUpdate) {
      // Xóa các thuộc tính cũ của variant
      await db.VariantAttributeValue.destroy({ where: { variantId: id }, transaction: t });
      // Gán thuộc tính mới
      await AttributeService.assignAttributesToVariant(id, attrsToUpdate, t);
    }

    await t.commit();

    const updated = await db.ProductVariant.findByPk(id, {
      include: [
        { model: db.AttributeValue, as: "attributes", include: [{ model: db.Attribute, as: "attribute" }] },
        { model: db.ProductImage, as: "images" }
      ]
    });

    return { errCode: 0, data: updated };
  } catch (e) {
    await t.rollback();
    console.error("Error updateVariant:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const deleteVariant = async (id) => {
  try {
    const variant = await db.ProductVariant.findByPk(id);
    if (!variant) return { errCode: 1, errMessage: "Variant not found" };
    await variant.destroy();
    return { errCode: 0, errMessage: "Variant deleted" };
  } catch (e) {
    console.error("Error deleteVariant:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

module.exports = {
  getVariantsByProductId,
  createVariant,
  updateVariant,
  deleteVariant,
};
