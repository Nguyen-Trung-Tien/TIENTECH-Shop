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

const updateProductTotalStock = async (productId, transaction) => {
  const totalStock = await db.ProductVariant.sum("stock", {
    where: { productId },
    transaction,
  });
  await db.Product.update(
    { totalStock: totalStock || 0 },
    { where: { id: productId }, transaction },
  );
};

const createVariant = async (data, t_external = null) => {
  const t = t_external || (await db.sequelize.transaction());
  try {
    const {
      productId,
      sku,
      price,
      stock,
      isActive = true,
      attributeValues,
      attributes,
    } = data;

    if (!productId || price == null || stock == null) {
      if (!t_external) await t.rollback();
      return { errCode: 2, errMessage: "Missing required fields" };
    }

    // Parse attribute values if they come as string
    let finalAttrValues = attributes || attributeValues || {};
    if (typeof finalAttrValues === "string") {
      try {
        finalAttrValues = JSON.parse(finalAttrValues);
      } catch (e) {
        finalAttrValues = {};
      }
    }

    const variant = await db.ProductVariant.create({
      productId,
      sku: sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      price,
      stock,
      isActive: !!isActive,
      attributeValues: finalAttrValues,
    }, { transaction: t });

    // Gán attributes vào junction table để hỗ trợ filter nâng cao
    if (finalAttrValues && Object.keys(finalAttrValues).length > 0) {
      await AttributeService.assignAttributesToVariant(variant.id, finalAttrValues, t);
    }

    // Cập nhật totalStock sản phẩm cha
    await updateProductTotalStock(productId, t);

    if (!t_external) await t.commit();
    
    // Fetch lại để trả về dữ liệu đầy đủ
    const fullVariant = await db.ProductVariant.findByPk(variant.id, {
      include: [
        { model: db.AttributeValue, as: "attributes", include: [{ model: db.Attribute, as: "attribute" }] }
      ]
    });

    return { errCode: 0, data: fullVariant };
  } catch (e) {
    if (!t_external) await t.rollback();
    console.error("Error createVariant:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const updateVariant = async (id, data, t_external = null) => {
  const t = t_external || (await db.sequelize.transaction());
  try {
    const variant = await db.ProductVariant.findByPk(id, { transaction: t });
    if (!variant) {
      if (!t_external) await t.rollback();
      return { errCode: 1, errMessage: "Variant not found" };
    }

    let finalAttrValues = data.attributes || data.attributeValues;
    if (typeof finalAttrValues === "string") {
      try {
        finalAttrValues = JSON.parse(finalAttrValues);
      } catch (e) {
        finalAttrValues = variant.attributeValues;
      }
    }

    const updateData = {
      sku: data.sku !== undefined ? data.sku : variant.sku,
      price: data.price !== undefined ? Number(data.price) : variant.price,
      discount: data.discount !== undefined ? Number(data.discount) : variant.discount,
      stock: data.stock !== undefined ? Number(data.stock) : variant.stock,
      isActive: data.isActive !== undefined ? !!data.isActive : variant.isActive,
      attributeValues: finalAttrValues !== undefined ? finalAttrValues : variant.attributeValues,
    };

    await variant.update(updateData, { transaction: t });

    if (finalAttrValues) {
      await db.VariantAttributeValue.destroy({ where: { variantId: id }, transaction: t });
      await AttributeService.assignAttributesToVariant(id, finalAttrValues, t);
    }

    await updateProductTotalStock(variant.productId, t);

    if (!t_external) await t.commit();

    const updated = await db.ProductVariant.findByPk(id, {
      include: [
        { model: db.AttributeValue, as: "attributes", include: [{ model: db.Attribute, as: "attribute" }] },
        { model: db.ProductImage, as: "images" }
      ]
    });

    return { errCode: 0, data: updated };
  } catch (error) {
    if (!t_external) await t.rollback();
    console.error("Error updateVariant:", error);
    return { errCode: 1, errMessage: error.message };
  }
};


const deleteVariant = async (id) => {
  const t = await db.sequelize.transaction();
  try {
    const variant = await db.ProductVariant.findByPk(id, { transaction: t });
    if (!variant) {
      await t.rollback();
      return { errCode: 1, errMessage: "Variant not found" };
    }
    const productId = variant.productId;
    await variant.destroy({ transaction: t });

    // Cập nhật totalStock sản phẩm cha
    await updateProductTotalStock(productId, t);

    await t.commit();
    return { errCode: 0, errMessage: "Variant deleted" };
  } catch (e) {
    await t.rollback();
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
