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
  updateProductEmbedding,
} = require("./productHelper");

const createProduct = async (data, imageRecords = []) => {
  const t = await db.sequelize.transaction();
  try {
    const {
      variants,
      attributes,
      options,
      price,
      stock,
      image,
      imageFile,
      deletedImages,
      specifications,
      ...productData
    } = data;

    if (!productData.slug && productData.name) {
      productData.slug = `${slugify(productData.name)}-${Date.now()}`;
    }
    productData.sku = await ensureUniqueSKU(productData.sku, t);
    productData.hasVariants = Array.isArray(variants) && variants.length > 0;
    productData.basePrice = Number(productData.basePrice || price || 0);

    if (specifications) {
      productData.specifications =
        typeof specifications === "string"
          ? JSON.parse(specifications)
          : specifications;
    }
    
    if (productData.hasVariants) {
      productData.totalStock = variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
    } else {
      productData.totalStock = Number(stock || productData.totalStock || 0);
    }

    // Xóa các trường rỗng không hợp lệ đối với kiểu dữ liệu trong DB
    if (productData.brandId === "" || isNaN(productData.brandId)) delete productData.brandId;
    if (productData.categoryId === "" || isNaN(productData.categoryId)) delete productData.categoryId;
    if (productData.flashSaleStart === "") delete productData.flashSaleStart;
    if (productData.flashSaleEnd === "") delete productData.flashSaleEnd;
    if (productData.flashSalePrice === "" || isNaN(productData.flashSalePrice)) delete productData.flashSalePrice;

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
    updateProductEmbedding(product).catch((err) =>
      console.error("Lỗi cập nhật embedding cho SP mới:", err)
    );
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

    // Handle Image Deletion
    if (updatedData.deletedImages) {
      const imagesToDelete = Array.isArray(updatedData.deletedImages) 
        ? updatedData.deletedImages 
        : JSON.parse(updatedData.deletedImages);
      
      if (imagesToDelete.length > 0) {
        await db.ProductImage.destroy({
          where: {
            productId: id,
            imageUrl: { [Op.in]: imagesToDelete }
          },
          transaction: t
        });
      }
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
      
      // Use user's hasVariants toggle if provided, otherwise derive from variants length
      const hasVariantsFinal = updatedData.hasVariants !== undefined 
        ? updatedData.hasVariants 
        : updatedData.variants.length > 0;

      await updatedProduct.update(
        {
          totalStock: finalTotalStock || 0,
          hasVariants: hasVariantsFinal,
        },
        { transaction: t },
      );
    } else if (updatedData.stock !== undefined) {
      await updatedProduct.update(
        { 
          totalStock: Number(updatedData.stock),
          hasVariants: updatedData.hasVariants !== undefined ? updatedData.hasVariants : product.hasVariants
        },
        { transaction: t },
      );
    } else if (updatedData.hasVariants !== undefined) {
      await updatedProduct.update(
        { hasVariants: updatedData.hasVariants },
        { transaction: t }
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
    updateProductEmbedding(updatedProduct).catch((err) =>
      console.error("Lỗi cập nhật embedding cho SP cập nhật:", err)
    );
    clearProductCache();
    return { errCode: 0, product: updatedProduct };
  } catch (e) {
    await t.rollback();
    console.error("Error updating product:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const ProductRepository = require("../../repository/ProductRepository");

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

  const data = await ProductRepository.getAllOptimized({
    whereCondition,
    offset,
    limit: l,
    include: [
      { model: db.Category, as: "category", attributes: ["id", "name", "slug"] },
      { model: db.Brand, as: "brand", attributes: ["id", "name"] },
      {
        model: db.ProductImage,
        as: "images",
        attributes: ["imageUrl", "isPrimary"],
      },
      {
        model: db.Review,
        as: "reviews",
        attributes: ["id", "rating"],
        required: false,
      },
    ],
  });

  const pagingData = getPagingData(data, page, l);
  const { items, ...paginationMetadata } = pagingData;

  const result = {
    errCode: 0,
    products: items.map((p) => {
      const pJSON = p.get({ plain: true });
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
    const product = await ProductRepository.getByIdOptimized(id, [
      { model: db.Category, as: "category", attributes: ["id", "name", "slug"] },
      { model: db.Brand, as: "brand", attributes: ["id", "name"] },
      {
        model: db.AttributeValue,
        as: "attributes",
        include: [{ model: db.Attribute, as: "attribute", attributes: ["id", "name", "code"] }],
      },
      { model: db.ProductImage, as: "images" },
      {
        model: db.ProductVariant,
        as: "variants",
        include: [
          {
            model: db.AttributeValue,
            as: "attributes",
            include: [{ model: db.Attribute, as: "attribute", attributes: ["id", "name", "code"] }],
          },
          { model: db.ProductImage, as: "images" },
        ],
      },
    ]);

    if (!product) return { errCode: 1, errMessage: "Product not found" };

    const plainProduct = product.get({ plain: true });
    const primary =
      plainProduct.images?.find((i) => i.isPrimary) || plainProduct.images?.[0];

    let specs = plainProduct.specifications || {};
    if (typeof specs === "string") {
      try {
        specs = JSON.parse(specs);
      } catch (e) {
        specs = {};
      }
    }

    return {
      errCode: 0,
      product: {
        ...applyFlashSaleToProduct(plainProduct),
        specifications: specs,
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
    const product = await db.Product.findByPk(id, {
      include: [{ model: db.OrderItem, as: "orderItems", attributes: ["id"], limit: 1 }],
    });

    if (!product) return { errCode: 1, errMessage: "Product not found" };

    if (product.orderItems && product.orderItems.length > 0) {
      // If product has order history, just deactivate it instead of hard delete
      product.isActive = false;
      await product.save();
      clearProductCache();
      return {
        errCode: 0,
        errMessage: "Sản phẩm đã có lịch sử đơn hàng. Đã chuyển sang trạng thái ngưng kinh doanh.",
      };
    }

    const deleted = await ProductRepository.destroy(id);
    if (!deleted) return { errCode: 1, errMessage: "Product not found" };
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

    const product = await ProductRepository.findOne({
      where: whereCondition,
      include: [
        { model: db.Category, as: "category", attributes: ["id", "name", "slug"] },
        { model: db.Brand, as: "brand", attributes: ["id", "name"] },
        {
          model: db.AttributeValue,
          as: "attributes",
          include: [{ model: db.Attribute, as: "attribute", attributes: ["id", "name", "code"] }],
        },
        { model: db.ProductImage, as: "images" },
        {
          model: db.ProductVariant,
          as: "variants",
          include: [
            {
              model: db.AttributeValue,
              as: "attributes",
              include: [{ model: db.Attribute, as: "attribute", attributes: ["id", "name", "code"] }],
            },
            { model: db.ProductImage, as: "images" },
          ],
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
