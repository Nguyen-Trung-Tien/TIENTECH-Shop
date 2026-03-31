const db = require("../models");
const { Op } = require("sequelize");
const { getLuckyColorsByYear } = require("../utils/fortuneUtils");
const NodeCache = require("node-cache");
const { getPagination, getPagingData } = require("../utils/paginationHelper");
const AttributeService = require("./AttributeService");

const productCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// --- CÁC HÀM HELPER NỘI BỘ ---

const ensureUniqueSKU = async (sku, transaction) => {
  if (!sku) return `PROD-${Date.now()}`;
  const existing = await db.Product.findOne({ 
    where: { sku: { [Op.like]: sku } }, 
    transaction 
  });
  if (existing) return `${sku}-${Date.now()}`;
  return sku;
};

const clearProductCache = () => {
  const keys = productCache.keys();
  keys.forEach((key) => {
    if (key.startsWith("products_")) {
      productCache.del(key);
    }
  });
};

const isFlashSaleActive = (product) => {
  if (!product || !product.isFlashSale) return false;
  if (!product.flashSaleStart || !product.flashSaleEnd) return false;

  const now = new Date();
  const start = new Date(product.flashSaleStart);
  const end = new Date(product.flashSaleEnd);
  return now >= start && now <= end;
};

const applyFlashSaleToProduct = (productData) => {
  const product = { ...productData };
  const originalPrice = Number(product.basePrice || product.price || 0);
  product.basePrice = originalPrice;
  product.originalPrice = originalPrice;
  product.flashSaleActive = isFlashSaleActive(product);

  if (product.flashSaleActive && product.flashSalePrice) {
    const salePrice = Number(product.flashSalePrice);
    product.displayPrice = salePrice;
    product.price = salePrice; 
    product.flashSaleDiscount =
      originalPrice > 0
        ? ((originalPrice - salePrice) / originalPrice) * 100
        : 0;
  } else {
    product.displayPrice = originalPrice;
    product.price = originalPrice;
    product.flashSaleDiscount = 0;
  }

  return product;
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

const disableExpiredFlashSales = async () => {
  try {
    const now = new Date();
    const [updated] = await db.Product.update(
      { isFlashSale: false },
      {
        where: {
          isFlashSale: true,
          flashSaleEnd: { [Op.lte]: now },
        },
      },
    );

    if (updated > 0) {
      clearProductCache();
    }

    return { errCode: 0, updated };
  } catch (error) {
    console.error("Error disabling expired flash sales:", error);
    return { errCode: 1, errMessage: error.message };
  }
};

// --- CÁC HÀM XỬ LÝ CHÍNH ---

const createProduct = async (data, imageRecords = []) => {
  const t = await db.sequelize.transaction();
  try {
    const newData = { ...data };

    if (!newData.slug && newData.name) {
      newData.slug = `${slugify(newData.name)}-${Date.now()}`;
    }

    newData.sku = await ensureUniqueSKU(newData.sku, t);

    newData.basePrice = newData.basePrice || newData.price || 0;
    if (newData.stock !== undefined) {
      newData.totalStock = Number(newData.stock);
    }

    const product = await db.Product.create(newData, { transaction: t });

    if (newData.attributes) {
      const attrs = typeof newData.attributes === 'string' ? JSON.parse(newData.attributes) : newData.attributes;
      await AttributeService.assignAttributesToProduct(product.id, attrs, t);
    }

    if (imageRecords.length > 0) {
      const records = imageRecords.map((img) => ({
        ...img,
        productId: product.id,
      }));
      await db.ProductImage.bulkCreate(records, { transaction: t });
    }

    await t.commit();
    clearProductCache();
    return { errCode: 0, product };
  } catch (e) {
    await t.rollback();
    console.error("Error creating product:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const createProductWithVariants = async (data, imageRecords = []) => {
  const t = await db.sequelize.transaction();
  try {
    const { options, variants: customVariants, ...productData } = data;

    if (!productData.slug && productData.name) {
      productData.slug = `${slugify(productData.name)}-${Date.now()}`;
    }
    
    productData.sku = await ensureUniqueSKU(productData.sku, t);
    productData.hasVariants = customVariants && customVariants.length > 0;

    if (productData.stock !== undefined) {
      productData.totalStock = Number(productData.stock);
    }

    const product = await db.Product.create(productData, { transaction: t });

    if (productData.attributes) {
      const attrs = typeof productData.attributes === 'string' ? JSON.parse(productData.attributes) : productData.attributes;
      await AttributeService.assignAttributesToProduct(product.id, attrs, t);
    }

    if (productData.hasVariants) {
      let finalTotalStock = 0;
      for (const variant of customVariants) {
        const variantStock = Number(variant.stock || 0);
        finalTotalStock += variantStock;

        const newVariant = await db.ProductVariant.create(
          {
            productId: product.id,
            sku: variant.sku || `${product.sku}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            price: variant.price || product.basePrice,
            stock: variantStock,
            attributeValues: variant.attributeValues || {},
            isActive: true,
          },
          { transaction: t }
        );

        if (variant.attributes) {
          await AttributeService.assignAttributesToVariant(newVariant.id, variant.attributes, t);
        }
      }
      await product.update({ totalStock: finalTotalStock }, { transaction: t });
    }

    if (imageRecords.length > 0) {
      const records = imageRecords.map((img) => ({
        ...img,
        productId: product.id,
      }));
      await db.ProductImage.bulkCreate(records, { transaction: t });
    }

    await t.commit();
    clearProductCache();
    return { errCode: 0, product };
  } catch (e) {
    await t.rollback();
    console.error("Error creating product with variants:", e);
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

    if (updatedData.name && updatedData.name !== product.name && !updatedData.slug) {
      updatedData.slug = `${slugify(updatedData.name)}-${product.id}`;
    }

    if (updatedData.sku && updatedData.sku !== product.sku) {
      updatedData.sku = await ensureUniqueSKU(updatedData.sku, t);
    }

    if (updatedData.stock !== undefined) {
      updatedData.totalStock = Number(updatedData.stock);
    }

    const updatedProduct = await product.update(updatedData, { transaction: t });

    if (updatedData.attributes) {
      const attrs = typeof updatedData.attributes === 'string' ? JSON.parse(updatedData.attributes) : updatedData.attributes;
      await db.ProductAttributeValue.destroy({ where: { productId: id }, transaction: t });
      await AttributeService.assignAttributesToProduct(id, attrs, t);
    }

    if (imageRecords.length > 0) {
      if (imageRecords.some((i) => i.isPrimary)) {
        await db.ProductImage.update({ isPrimary: false }, { where: { productId: id }, transaction: t });
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

const getAllProducts = async (categoryId, page = 1, limit = 10, isFlashSale = false) => {
  const cacheKey = `products_${categoryId || "all"}_${isFlashSale ? "flash" : "all"}_${page}_${limit}`;
  const cachedData = productCache.get(cacheKey);
  if (cachedData) return cachedData;

  const { offset, limit: l } = getPagination(page, limit);
  const whereCondition = {};
  if (categoryId) whereCondition.categoryId = categoryId;

  if (isFlashSale) {
    const now = new Date();
    whereCondition.isFlashSale = true;
    whereCondition.flashSaleStart = { [Op.lte]: now };
    whereCondition.flashSaleEnd = { [Op.gte]: now };
  } else {
    whereCondition.isActive = true;
  }

  const data = await db.Product.findAndCountAll({
    where: whereCondition,
    include: [
      { model: db.Category, as: "category" },
      { model: db.Brand, as: "brand" },
      { model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] },
    ],
    limit: l,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const pagingData = getPagingData(data, page, l);
  const { items, ...paginationMetadata } = pagingData;

  const result = {
    errCode: 0,
    products: items.map((p) => {
      const pJSON = p.toJSON();
      const primary = pJSON.images?.find(i => i.isPrimary) || pJSON.images?.[0];
      return applyFlashSaleToProduct({ ...pJSON, image: primary?.imageUrl || null });
    }),
    pagination: paginationMetadata,
  };

  productCache.set(cacheKey, result, isFlashSale ? 60 : 600);
  return result;
};

const getProductById = async (id) => {
  try {
    const product = await db.Product.findByPk(id, {
      include: [
        { model: db.Category, as: "category" },
        { model: db.Brand, as: "brand" },
        { model: db.AttributeValue, as: "attributes", include: [{ model: db.Attribute, as: "attribute" }] },
        { model: db.ProductImage, as: "images" },
        { 
          model: db.ProductVariant, 
          as: "variants", 
          include: [
            { model: db.AttributeValue, as: "attributes", include: [{ model: db.Attribute, as: "attribute" }] },
            { model: db.ProductImage, as: "images" }
          ] 
        },
      ],
    });

    if (!product) return { errCode: 1, errMessage: "Product not found" };

    const plainProduct = product.get({ plain: true });
    const primary = plainProduct.images?.find(i => i.isPrimary) || plainProduct.images?.[0];

    return { 
      errCode: 0, 
      product: {
        ...applyFlashSaleToProduct(plainProduct),
        image: primary?.imageUrl || null,
        variants: plainProduct.variants?.map(v => ({
          ...v,
          imageUrl: v.images?.[0]?.imageUrl || null
        }))
      }
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

const searchProducts = async (query, page = 1, limit = 10) => {
  const { offset, limit: l } = getPagination(page, limit);
  const whereCondition = { isActive: true };
  if (query) {
    whereCondition[Op.or] = [
      { name: { [Op.like]: `%${query}%` } },
      { sku: { [Op.like]: `%${query}%` } },
    ];
  }

  const data = await db.Product.findAndCountAll({
    where: whereCondition,
    include: [
      { model: db.Category, as: "category" },
      { model: db.Brand, as: "brand" },
      { model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] },
    ],
    limit: l,
    offset,
    order: [["id", "DESC"]],
  });

  const pagingData = getPagingData(data, page, l);
  const { items, ...paginationMetadata } = pagingData;

  return {
    errCode: 0,
    products: items.map((p) => {
      const pJSON = p.toJSON();
      const primary = pJSON.images?.find(i => i.isPrimary) || pJSON.images?.[0];
      return { ...applyFlashSaleToProduct(pJSON), image: primary?.imageUrl || null };
    }),
    pagination: paginationMetadata,
  };
};

const searchSuggestions = async (query, limit = 8) => {
  const q = (query || "").trim();
  if (!q) return { errCode: 0, suggestions: { products: [], keywords: [], brands: [], categories: [] } };

  const productSuggestionsRaw = await db.Product.findAll({
    where: { isActive: true, name: { [Op.like]: `%${q}%` } },
    attributes: ["id", "name", "basePrice", "isFlashSale", "flashSalePrice", "flashSaleStart", "flashSaleEnd", "sold"],
    include: [{ model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] }],
    limit,
    order: [["sold", "DESC"]],
  });

  const productSuggestions = productSuggestionsRaw.map((p) => {
    const raw = p.toJSON();
    const processed = applyFlashSaleToProduct(raw);
    const primary = raw.images?.find((i) => i.isPrimary) || raw.images?.[0];
    return {
      id: processed.id,
      name: processed.name,
      price: processed.displayPrice,
      originalPrice: processed.basePrice,
      discount: processed.flashSaleDiscount,
      image: primary ? primary.imageUrl : null,
      isFlashSale: processed.flashSaleActive
    };
  });

  const brandSuggestions = await db.Brand.findAll({ where: { name: { [Op.like]: `%${q}%` } }, attributes: ["id", "name"], limit: 3 });
  const categorySuggestions = await db.Category.findAll({ where: { name: { [Op.like]: `%${q}%` } }, attributes: ["id", "name"], limit: 3 });

  return { errCode: 0, suggestions: { products: productSuggestions, keywords: [q], brands: brandSuggestions, categories: categorySuggestions } };
};

const filterProducts = async ({
  brandId, categoryId, minPrice, maxPrice,
  search = "", sort, ram, rom, screen, battery, os, refresh_rate,
  page = 1, limit = 12,
}) => {
  try {
    const conditions = {
      isActive: true,
    };

    if (minPrice !== undefined && minPrice !== "" && maxPrice !== undefined && maxPrice !== "") {
      conditions.basePrice = { [Op.between]: [Number(minPrice), Number(maxPrice)] };
    } else if (minPrice !== undefined && minPrice !== "") {
      conditions.basePrice = { [Op.gte]: Number(minPrice) };
    } else if (maxPrice !== undefined && maxPrice !== "") {
      conditions.basePrice = { [Op.lte]: Number(maxPrice) };
    }

    if (brandId && brandId !== "") conditions.brandId = Number(brandId);
    if (categoryId && categoryId !== "") conditions.categoryId = Number(categoryId);
    if (search && search !== "") conditions.name = { [Op.like]: `%${search}%` };

    const filterParams = { ram, rom, screen, battery, os, refresh_rate };
    const filterValues = [];
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key] && filterParams[key] !== "") {
        const vals = Array.isArray(filterParams[key]) ? filterParams[key] : String(filterParams[key]).split(",");
        filterValues.push(...vals);
      }
    });

    const include = [
      { model: db.Brand, as: "brand" },
      { model: db.Category, as: "category" },
      { model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] },
    ];

    if (filterValues.length > 0) {
      include.push({
        model: db.AttributeValue,
        as: "attributes",
        where: { value: { [Op.in]: filterValues } },
        through: { attributes: [] }
      });
    }

    let order = [];
    if (sort === "price_asc") order = [["basePrice", "ASC"]];
    if (sort === "price_desc") order = [["basePrice", "DESC"]];
    if (sort === "newest") order = [["createdAt", "DESC"]];
    if (!order.length) order = [["id", "DESC"]];

    const { offset, limit: l } = getPagination(page, limit);
    const data = await db.Product.findAndCountAll({
      where: conditions,
      include,
      order,
      limit: l,
      offset,
      distinct: true,
    });

    const pagingData = getPagingData(data, page, l);
    const { items, ...paginationMetadata } = pagingData;

    return {
      errCode: 0,
      data: items.map((p) => {
        const pJSON = p.toJSON();
        const primary = pJSON.images?.find(i => i.isPrimary) || pJSON.images?.[0];
        return { ...applyFlashSaleToProduct(pJSON), image: primary?.imageUrl || null };
      }),
      pagination: paginationMetadata,
    };
  } catch (error) {
    console.error(error);
    return { errCode: 1, errMessage: error.message };
  }
};

const getProductBySlug = async (slug) => {
  try {
    const whereCondition = { isActive: true };
    if (!isNaN(slug) && Number.isInteger(Number(slug))) {
      whereCondition[Op.or] = [ { slug: slug }, { id: parseInt(slug) } ];
    } else {
      whereCondition.slug = slug;
    }

    const product = await db.Product.findOne({
      where: whereCondition,
      include: [
        { model: db.Category, as: "category" },
        { model: db.Brand, as: "brand" },
        { model: db.AttributeValue, as: "attributes", include: [{ model: db.Attribute, as: "attribute" }] },
        { model: db.ProductImage, as: "images" },
        { 
          model: db.ProductVariant, 
          as: "variants", 
          include: [
            { model: db.AttributeValue, as: "attributes", include: [{ model: db.Attribute, as: "attribute" }] },
            { model: db.ProductImage, as: "images" }
          ] 
        },
      ],
    });

    if (!product) return { errCode: 1, errMessage: "Product not found" };

    const plainProduct = product.get({ plain: true });
    const variants = plainProduct.variants || [];
    const prices = variants.map((v) => Number(v.price));
    const minPrice = prices.length > 0 ? Math.min(...prices) : Number(plainProduct.basePrice);
    const maxPrice = prices.length > 0 ? Math.max(...prices) : Number(plainProduct.basePrice);
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

    const primaryImage = plainProduct.images?.find((img) => img.isPrimary) || plainProduct.images?.[0];

    return {
      errCode: 0,
      product: {
        ...applyFlashSaleToProduct(plainProduct),
        image: primaryImage ? primaryImage.imageUrl : null,
        priceRange: { min: minPrice, max: maxPrice, display: minPrice === maxPrice ? `${minPrice}` : `${minPrice} - ${maxPrice}` },
        totalStock,
        variants: variants.map((v) => ({ ...v, imageUrl: v.images?.[0]?.imageUrl || null })),
      },
    };
  } catch (e) {
    console.error("Error fetching product by slug:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const recommendProducts = async (productId, page = 1, limit = 6) => {
  try {
    const product = await db.Product.findByPk(productId);
    if (!product) return { errCode: 1, errMessage: "Product not found" };

    const price = Number(product.basePrice);
    const where = {
      id: { [Op.ne]: productId },
      isActive: true,
      [Op.or]: [
        { categoryId: product.categoryId },
        { brandId: product.brandId },
        { basePrice: { [Op.between]: [price * 0.8, price * 1.2] } },
      ],
    };

    const { offset, limit: l } = getPagination(page, limit);
    const { count, rows } = await db.Product.findAndCountAll({
      where,
      include: [{ model: db.Brand, as: "brand" }, { model: db.Category, as: "category" }, { model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] }],
      order: [["sold", "DESC"], ["createdAt", "DESC"]],
      offset, limit: l,
    });

    const pagingData = getPagingData({ count, rows }, page, l);
    const { items, ...paginationMetadata } = pagingData;

    return {
      errCode: 0,
      data: items.map((p) => {
        const pJSON = p.toJSON();
        const primary = pJSON.images?.find(i => i.isPrimary) || pJSON.images?.[0];
        return { ...pJSON, image: primary?.imageUrl || null };
      }),
      pagination: paginationMetadata,
    };
  } catch (e) {
    console.error("Error recommending products:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const getFlashSaleProducts = async (page = 1, limit = 10) => {
  const now = new Date();
  const { offset, limit: l } = getPagination(page, limit);
  const data = await db.Product.findAndCountAll({
    where: { isActive: true, isFlashSale: true, flashSaleStart: { [Op.lte]: now }, flashSaleEnd: { [Op.gte]: now } },
    include: [{ model: db.Category, as: "category" }, { model: db.Brand, as: "brand" }, { model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] }],
    limit: l, offset, order: [["flashSaleStart", "ASC"]],
  });
  const pagingData = getPagingData(data, page, l);
  const { items, ...paginationMetadata } = pagingData;

  return {
    errCode: 0,
    products: items.map((p) => {
      const pJSON = p.toJSON();
      const primary = pJSON.images?.find(i => i.isPrimary) || pJSON.images?.[0];
      return applyFlashSaleToProduct({ ...pJSON, image: primary?.imageUrl || null });
    }),
    pagination: paginationMetadata,
  };
};

const getDiscountedProducts = async (page = 1, limit = 10) => {
  const { offset, limit: l } = getPagination(page, limit);
  const now = new Date();
  const data = await db.Product.findAndCountAll({
    where: {
      isActive: true,
      [Op.or]: [
        {
          isFlashSale: true,
          flashSaleStart: { [Op.lte]: now },
          flashSaleEnd: { [Op.gte]: now },
        },
      ],
    },
    include: [
      { model: db.Category, as: "category" },
      { model: db.Brand, as: "brand" },
      { model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] },
    ],
    limit: l,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const pagingData = getPagingData(data, page, l);
  const { items, ...paginationMetadata } = pagingData;

  return {
    errCode: 0,
    products: items.map((p) => {
      const pJSON = p.toJSON();
      const primary = pJSON.images?.find(i => i.isPrimary) || pJSON.images?.[0];
      return applyFlashSaleToProduct({ ...pJSON, image: primary?.imageUrl || null });
    }),
    pagination: paginationMetadata,
  };
};

const recommendFortuneProducts = async ({ birthYear, brandId, minPrice, maxPrice, categoryId, page = 1, limit = 6 }) => {
  try {
    const luckyColors = getLuckyColorsByYear(Number(birthYear));
    const where = { isActive: true };
    if (luckyColors.length) {
      where[Op.or] = luckyColors.map((color) => ({ specifications: { [Op.like]: `%${color}%` } }));
    }
    if (brandId) where.brandId = brandId;
    if (categoryId) where.categoryId = categoryId;
    if (minPrice != null) where.basePrice = { ...where.basePrice, [Op.gte]: minPrice };
    if (maxPrice != null) where.basePrice = { ...where.basePrice, [Op.lte]: maxPrice };

    const { offset, limit: l } = getPagination(page, limit);
    const { count, rows } = await db.Product.findAndCountAll({
      where,
      include: [{ model: db.Brand, as: "brand" }, { model: db.Category, as: "category" }, { model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] }],
      order: [["sold", "DESC"], ["createdAt", "DESC"]],
      offset, limit: l,
    });

    const pagingData = getPagingData({ count, rows }, page, l);
    const { items, ...paginationMetadata } = pagingData;

    return {
      errCode: 0,
      data: items.map((p) => {
        const pJSON = p.toJSON();
        const primary = pJSON.images?.find(i => i.isPrimary) || pJSON.images?.[0];
        const product = { ...pJSON, image: primary?.imageUrl || null };
        product.isLuckyColor = luckyColors.includes(product.color);
        return product;
      }),
      luckyColors,
      pagination: paginationMetadata,
    };
  } catch (e) {
    console.error("Error in recommendFortuneProducts:", e);
    return { errCode: -1, errMessage: e.message };
  }
};

module.exports = {
  createProduct,
  createProductWithVariants,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  searchSuggestions,
  filterProducts,
  getProductBySlug,
  recommendProducts,
  getFlashSaleProducts,
  getDiscountedProducts,
  disableExpiredFlashSales,
  recommendFortuneProducts
};
