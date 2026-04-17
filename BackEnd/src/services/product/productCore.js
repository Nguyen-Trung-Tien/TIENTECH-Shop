const db = require("../../models");
const { Op } = require("sequelize");
const { getCache, setCache } = require("../../config/redis");
const { getPagination, getPagingData } = require("../../utils/paginationHelper");
const AttributeService = require("../AttributeService");
const { slugify } = require("../../utils/slugHelper");
const ProductVariantService = require("../ProductVariantService");
const {
  ensureUniqueSKU,
  clearProductCache,
  applyFlashSaleToProduct,
} = require("./productHelper");

const createProduct = async (data, imageRecords = []) => {
  const t = await db.sequelize.transaction();
  try {
    const { variants, attributes, ...productData } = data;

    if (!productData.slug && productData.name) {
      productData.slug = `${slugify(productData.name)}-${Date.now()}`;
    }
    productData.sku = await ensureUniqueSKU(productData.sku, t);
    productData.hasVariants = Array.isArray(variants) && variants.length > 0;
    productData.basePrice = Number(productData.basePrice || productData.price || 0);
    
    if (productData.hasVariants) {
      productData.totalStock = variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
    } else {
      productData.totalStock = Number(productData.stock || productData.totalStock || 0);
    }

    const product = await db.Product.create(productData, { transaction: t });

    if (attributes) {
      const attrs = typeof attributes === "string" ? JSON.parse(attributes) : attributes;
      await AttributeService.assignAttributesToProduct(product.id, attrs, t);
    }

    if (productData.hasVariants) {
      for (const v of variants) {
        await ProductVariantService.createVariant({
          ...v,
          productId: product.id,
          attributeValues: v.attributeValues || v.attributes || {}
        }, t);
      }
    }

    if (imageRecords.length > 0) {
      const records = imageRecords.map((img) => ({ ...img, productId: product.id }));
      await db.ProductImage.bulkCreate(records, { transaction: t });
    }

    await t.commit();
    await clearProductCache(product.categoryId);
    return { errCode: 0, product };
  } catch (e) {
    await t.rollback();
    console.error("[ProductCoreService] createProduct Error:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const updateProduct = async (id, data, imageRecords = []) => {
  const t = await db.sequelize.transaction();
  try {
    const product = await db.Product.findByPk(id, { transaction: t });
    if (!product) {
      await t.rollback();
      return { errCode: 1, errMessage: "Product not found" };
    }
    const updatedData = { ...data };

    if (
      updatedData.name &&
      updatedData.name !== product.name &&
      !updatedData.slug
    ) {
      updatedData.slug = `${slugify(updatedData.name)}-${product.id}`;
    }

    if (updatedData.sku && updatedData.sku !== product.sku) {
      updatedData.sku = await ensureUniqueSKU(updatedData.sku, t);
    }

    const updatedProduct = await product.update(updatedData, {
      transaction: t,
    });

    if (updatedData.specifications) {
      let specs = updatedData.specifications;
      if (typeof specs === "string") {
        try {
          specs = JSON.parse(specs);
        } catch (e) {
          console.error("Error parsing specs in updateProduct:", e);
        }
      }
      await updatedProduct.update(
        { specifications: specs },
        { transaction: t },
      );
    }

    if (updatedData.attributes) {
      const attrs =
        typeof updatedData.attributes === "string"
          ? JSON.parse(updatedData.attributes)
          : updatedData.attributes;
      await db.ProductAttributeValue.destroy({
        where: { productId: id },
        transaction: t,
      });
      await AttributeService.assignAttributesToProduct(id, attrs, t);
    }

    if (updatedData.variants && Array.isArray(updatedData.variants)) {
      const incomingVariantIds = updatedData.variants
        .filter((v) => v.id)
        .map((v) => v.id);

      await db.ProductVariant.destroy({
        where: {
          productId: id,
          id: { [Op.notIn]: incomingVariantIds },
        },
        transaction: t,
      });

      for (const vData of updatedData.variants) {
        if (vData.id) {
          await ProductVariantService.updateVariant(vData.id, vData, t);
        } else {
          await ProductVariantService.createVariant({
            ...vData,
            productId: id,
          }, t);
        }
      }

      const finalTotalStock = await db.ProductVariant.sum("stock", {
        where: { productId: id },
        transaction: t,
      });
      
      await updatedProduct.update(
        {
          totalStock: finalTotalStock || 0,
          hasVariants: updatedData.variants.length > 0,
        },
        { transaction: t },
      );
    } else if (updatedData.stock !== undefined) {
      await updatedProduct.update(
        { totalStock: Number(updatedData.stock) },
        { transaction: t },
      );
    }

    if (imageRecords.length > 0) {
      if (imageRecords.some((i) => i.isPrimary)) {
        await db.ProductImage.update(
          { isPrimary: false },
          { where: { productId: id }, transaction: t },
        );
      }
      const records = imageRecords.map((img) => ({ ...img, productId: id }));
      await db.ProductImage.bulkCreate(records, { transaction: t });
    }

    await t.commit();
    clearProductCache();
    return { errCode: 0, product: updatedProduct };
  } catch (e) {
    await t.rollback();
    console.error("Error updating product:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const getAllProducts = async (
  categoryId,
  page = 1,
  limit = 10,
  isFlashSale = false,
  isAdmin = false,
) => {
  const cacheKey = `products_${categoryId || "all"}_${isFlashSale ? "flash" : "all"}_${page}_${limit}_${isAdmin}`;
  const cachedData = await getCache(cacheKey);
  if (cachedData && !isAdmin) return cachedData;

  const { offset, limit: l } = getPagination(page, limit);
  const whereCondition = {};
  if (categoryId) whereCondition.categoryId = categoryId;

  if (isFlashSale) {
    const now = new Date();
    whereCondition.isFlashSale = true;
    whereCondition.flashSaleStart = { [Op.lte]: now };
    whereCondition.flashSaleEnd = { [Op.gte]: now };
  } else if (!isAdmin) {
    whereCondition.isActive = true;
  }

  const data = await db.Product.findAndCountAll({
    where: whereCondition,
    include: [
      { model: db.Category, as: "category" },
      { model: db.Brand, as: "brand" },
      {
        model: db.ProductImage,
        as: "images",
        attributes: ["imageUrl", "isPrimary"],
      },
    ],
    limit: l,
    offset,
    order: [["createdAt", "DESC"]],
    distinct: true,
  });

  const pagingData = getPagingData(data, page, l);
  const { items, ...paginationMetadata } = pagingData;

  const result = {
    errCode: 0,
    products: items.map((p) => {
      const pJSON = p.toJSON();
      const primary =
        pJSON.images?.find((i) => i.isPrimary) || pJSON.images?.[0];
      return applyFlashSaleToProduct({
        ...pJSON,
        discount: pJSON.discount || 0,
        image: primary?.imageUrl || null,
      });
    }),
    pagination: paginationMetadata,
  };

  if (!isAdmin) {
    await setCache(cacheKey, result, isFlashSale ? 60 : 600);
  }
  return result;
};

const getProductById = async (id) => {
  try {
    const product = await db.Product.findByPk(id, {
      include: [
        { model: db.Category, as: "category" },
        { model: db.Brand, as: "brand" },
        {
          model: db.AttributeValue,
          as: "attributes",
          include: [{ model: db.Attribute, as: "attribute" }],
        },
        { model: db.ProductImage, as: "images" },
        {
          model: db.ProductVariant,
          as: "variants",
          include: [
            {
              model: db.AttributeValue,
              as: "attributes",
              include: [{ model: db.Attribute, as: "attribute" }],
            },
            { model: db.ProductImage, as: "images" },
          ],
          distinct: true,
        },
      ],
    });

    if (!product) return { errCode: 1, errMessage: "Product not found" };

    const plainProduct = product.get({ plain: true });
    const primary =
      plainProduct.images?.find((i) => i.isPrimary) || plainProduct.images?.[0];

    return {
      errCode: 0,
      product: {
        ...applyFlashSaleToProduct(plainProduct),
        image: primary?.imageUrl || null,
        variants: plainProduct.variants?.map((v) => ({
          ...v,
          imageUrl: v.images?.[0]?.imageUrl || null,
        })),
      },
    };
  } catch (e) {
    console.error("Error fetching product by id:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const deleteProduct = async (id) => {
  try {
    const product = await db.Product.findByPk(id);
    if (!product) return { errCode: 1, errMessage: "Product not found" };
    await product.destroy();
    clearProductCache();
    return { errCode: 0, errMessage: "Product deleted successfully" };
  } catch (e) {
    console.error("Error deleting product:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const getProductBySlug = async (slug) => {
  try {
    const whereCondition = { isActive: true };
    if (!isNaN(slug) && Number.isInteger(Number(slug))) {
      whereCondition[Op.or] = [{ slug: slug }, { id: parseInt(slug) }];
    } else {
      whereCondition.slug = slug;
    }

    const product = await db.Product.findOne({
      where: whereCondition,
      include: [
        { model: db.Category, as: "category" },
        { model: db.Brand, as: "brand" },
        {
          model: db.AttributeValue,
          as: "attributes",
          include: [{ model: db.Attribute, as: "attribute" }],
        },
        { model: db.ProductImage, as: "images" },
        {
          model: db.ProductVariant,
          as: "variants",
          include: [
            {
              model: db.AttributeValue,
              as: "attributes",
              include: [{ model: db.Attribute, as: "attribute" }],
            },
            { model: db.ProductImage, as: "images" },
          ],
          distinct: true,
        },
      ],
    });

    if (!product) return { errCode: 1, errMessage: "Product not found" };

    const plainProduct = product.get({ plain: true });
    const variants = plainProduct.variants || [];
    const prices = variants.map((v) => Number(v.price));
    const minPrice =
      prices.length > 0 ? Math.min(...prices) : Number(plainProduct.basePrice);
    const maxPrice =
      prices.length > 0 ? Math.max(...prices) : Number(plainProduct.basePrice);
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

    const primaryImage =
      plainProduct.images?.find((img) => img.isPrimary) ||
      plainProduct.images?.[0];

    return {
      errCode: 0,
      product: {
        ...applyFlashSaleToProduct(plainProduct),
        image: primaryImage ? primaryImage.imageUrl : null,
        priceRange: {
          min: minPrice,
          max: maxPrice,
          display:
            minPrice === maxPrice ? `${minPrice}` : `${minPrice} - ${maxPrice}`,
        },
        totalStock,
        variants: variants.map((v) => ({
          ...v,
          imageUrl: v.images?.[0]?.imageUrl || null,
        })),
      },
    };
  } catch (e) {
    console.error("Error fetching product by slug:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
  getProductBySlug,
};
