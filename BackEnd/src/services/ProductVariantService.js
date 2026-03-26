const db = require("../models");

const getVariantsByProductId = async (productId) => {
  try {
    const variants = await db.ProductVariant.findAll({
      where: { productId },
      include: [{ model: db.ProductImage, as: "images", attributes: ["id", "imageUrl", "isPrimary"] }],
      order: [["id", "ASC"]],
    });
    return { errCode: 0, data: variants };
  } catch (e) {
    console.error("Error getVariantsByProductId:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const createVariant = async (data) => {
  try {
    const {
      productId,
      sku,
      price,
      stock,
      isActive = true,
      attributeValues = {},
    } = data;

    if (!productId || price == null || stock == null) {
      return { errCode: 2, errMessage: "Missing required fields" };
    }

    const variant = await db.ProductVariant.create({
      productId,
      sku: sku || null,
      price,
      stock,
      isActive: !!isActive,
      attributeValues,
    });

    return { errCode: 0, data: variant };
  } catch (e) {
    console.error("Error createVariant:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const updateVariant = async (id, data) => {
  try {
    const variant = await db.ProductVariant.findByPk(id);
    if (!variant) {
      return { errCode: 1, errMessage: "Variant not found" };
    }

    const updateData = {
      sku: data.sku !== undefined ? data.sku : variant.sku,
      price: data.price !== undefined ? data.price : variant.price,
      stock: data.stock !== undefined ? data.stock : variant.stock,
      isActive: data.isActive !== undefined ? data.isActive : variant.isActive,
      attributeValues: data.attributeValues !== undefined ? data.attributeValues : variant.attributeValues,
    };

    const updated = await variant.update(updateData);

    return { errCode: 0, data: updated };
  } catch (e) {
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
