const db = require("../models");
const { Op } = require("sequelize");
const { getLuckyColorsByYear } = require("../utils/fortuneUtils");
const NodeCache = require("node-cache");

const productCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

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
  const originalPrice = Number(product.price);
  product.basePrice = originalPrice;
  product.originalPrice = originalPrice;
  product.flashSaleActive = isFlashSaleActive(product);

  if (product.flashSaleActive && product.flashSalePrice) {
    const salePrice = Number(product.flashSalePrice);
    product.displayPrice = salePrice;
    product.price = salePrice; // legacy usage in UI
    product.flashSaleDiscount =
      originalPrice > 0
        ? ((originalPrice - salePrice) / originalPrice) * 100
        : 0;
  } else if (Number(product.discount) > 0) {
    const discount = Number(product.discount);
    const discountedPrice = originalPrice * (1 - discount / 100);
    product.displayPrice = Number(discountedPrice.toFixed(2));
    product.price = product.displayPrice;
    product.flashSaleActive = false;
    product.flashSaleDiscount = discount;
  } else {
    product.displayPrice = originalPrice;
    product.price = originalPrice;
    product.flashSaleDiscount = 0;
  }

  return product;
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

const createProduct = async (data, imageRecords = []) => {
  const t = await db.sequelize.transaction();
  try {
    const newData = { ...data };
    const product = await db.Product.create(newData, { transaction: t });

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

const getAllProducts = async (
  categoryId,
  page = 1,
  limit = 10,
  isFlashSale = false,
) => {
  const cacheKey = `products_${categoryId || "all"}_${isFlashSale ? "flash" : "all"}_${page}_${limit}`;
  const cachedData = productCache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const offset = (page - 1) * limit;
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

  const { count, rows } = await db.Product.findAndCountAll({
    where: whereCondition,
    include: [
      { model: db.Category, as: "category" },
      { model: db.Brand, as: "brand" },
      { model: db.Review, as: "reviews" },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const result = {
    errCode: 0,
    products: rows.map((p) => {
      const raw = { ...p.toJSON(), image: p.image || null };
      return applyFlashSaleToProduct(raw);
    }),
    totalItems: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  };

  productCache.set(cacheKey, result);
  return result;
};

const getProductById = async (id) => {
  try {
    const product = await db.Product.findByPk(id, {
      include: [
        { model: db.Category, as: "category" },
        { model: db.Brand, as: "brand" },
        {
          model: db.ProductImage,
          as: "images",
          attributes: ["id", "imageUrl", "isPrimary"],
        },
        {
          model: db.ProductVariant,
          as: "variants",
          attributes: [
            "id",
            "sku",
            "price",
            "stock",
            "isActive",
            "attributes",
            "imageUrl",
          ],
        },
      ],
    });

    if (!product) return { errCode: 1, errMessage: "Product not found" };

    const images = Array.isArray(product.images)
      ? [...product.images].sort((a, b) => {
          if (a.isPrimary === b.isPrimary) return a.id - b.id;
          return a.isPrimary ? -1 : 1;
        })
      : [];

    const formattedProduct = applyFlashSaleToProduct({
      ...product.toJSON(),
      image: product.image || null,
      sold: product.sold || 0,
      images: images.map((i) => ({
        id: i.id,
        imageUrl: i.imageUrl,
        isPrimary: i.isPrimary,
      })),
    });

    return {
      errCode: 0,
      product: formattedProduct,
    };
  } catch (e) {
    console.error("Error fetching product:", e);
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

    const updatedProduct = await product.update(updatedData, {
      transaction: t,
    });

    if (imageRecords.length > 0) {
      if (imageRecords.some((i) => i.isPrimary)) {
        await db.ProductImage.update(
          { isPrimary: false },
          { where: { productId: id }, transaction: t },
        );
      }

      const records = imageRecords.map((img) => ({
        ...img,
        productId: updatedProduct.id,
      }));
      await db.ProductImage.bulkCreate(records, { transaction: t });
    }

    await t.commit();
    return { errCode: 0, product: updatedProduct };
  } catch (e) {
    await t.rollback();
    console.error("Error updating product:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const deleteProduct = async (id) => {
  try {
    const product = await db.Product.findByPk(id);
    if (!product) return { errCode: 1, errMessage: "Product not found" };
    await product.destroy();
    return { errCode: 0, errMessage: "Product deleted successfully" };
  } catch (e) {
    console.error("Error deleting product:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const searchProducts = async (query, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const { Op } = db.Sequelize;

  const whereCondition = query ? { name: { [Op.like]: `%${query}%` } } : {};

  // Tìm sản phẩm phân trang (dùng cho trang kết quả tìm kiếm)
  const { count, rows } = await db.Product.findAndCountAll({
    where: whereCondition,
    include: [
      { model: db.Category, as: "category" },
      { model: db.Brand, as: "brand" },
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  // GỢI Ý PRODUCT (lightweight → dành cho Smart Search)
  const productSuggestions = await db.Product.findAll({
    where: {
      name: { [Op.like]: `%${query}%` },
    },
    attributes: ["id", "name", "price", "image"],
    limit: 8,
    order: [["sold", "DESC"]],
  });

  // GỢI Ý KEYWORD
  const keywordSuggestions = [`${query}`];

  // GỢI Ý BRAND
  const brandSuggestions = await db.Brand.findAll({
    where: { name: { [Op.like]: `%${query}%` } },
    attributes: ["id", "name"],
    limit: 5,
  });

  // GỢI Ý CATEGORY
  const categorySuggestions = await db.Category.findAll({
    where: { name: { [Op.like]: `%${query}%` } },
    attributes: ["id", "name"],
    limit: 5,
  });

  return {
    errCode: 0,
    products: rows.map((p) => ({ ...p.toJSON(), image: p.image || null })),
    totalItems: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),

    // Dành cho Smart Search
    suggestions: {
      products: productSuggestions,
      keywords: keywordSuggestions,
      brands: brandSuggestions,
      categories: categorySuggestions,
    },
  };
};

const searchSuggestions = async (query, limit = 8) => {
  const { Op } = db.Sequelize;
  const q = (query || "").trim();

  if (!q) {
    return {
      errCode: 0,
      suggestions: { products: [], keywords: [], brands: [], categories: [] },
    };
  }

  const productSuggestions = await db.Product.findAll({
    where: { name: { [Op.like]: `%${q}%` } },
    attributes: ["id", "name", "price", "image"],
    limit,
    order: [["sold", "DESC"]],
  });

  const brandSuggestions = await db.Brand.findAll({
    where: { name: { [Op.like]: `%${q}%` } },
    attributes: ["id", "name"],
    limit: 5,
  });

  const categorySuggestions = await db.Category.findAll({
    where: { name: { [Op.like]: `%${q}%` } },
    attributes: ["id", "name"],
    limit: 5,
  });

  return {
    errCode: 0,
    suggestions: {
      products: productSuggestions,
      keywords: [q],
      brands: brandSuggestions,
      categories: categorySuggestions,
    },
  };
};

const updateProductSold = async (productId, quantity) => {
  try {
    const product = await db.Product.findByPk(productId);
    if (!product) return { errCode: 1, errMessage: "Product not found" };

    await product.increment("sold", { by: quantity });
    await product.decrement("stock", { by: quantity });

    return { errCode: 0, errMessage: "Updated product sold count" };
  } catch (e) {
    console.error("Error updating sold count:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const getDiscountedProducts = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const now = new Date();
  const { count, rows } = await db.Product.findAndCountAll({
    where: {
      isActive: true,
      [Op.or]: [
        { discount: { [db.Sequelize.Op.gt]: 0 } },
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
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    errCode: 0,
    products: rows.map((p) => {
      const raw = { ...p.toJSON(), image: p.image || null };
      return applyFlashSaleToProduct(raw);
    }),
    totalItems: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  };
};

const getFlashSaleProducts = async (page = 1, limit = 10) => {
  const now = new Date();
  const offset = (page - 1) * limit;

  const { count, rows } = await db.Product.findAndCountAll({
    where: {
      isActive: true,
      isFlashSale: true,
      flashSaleStart: { [Op.lte]: now },
      flashSaleEnd: { [Op.gte]: now },
    },
    include: [
      { model: db.Category, as: "category" },
      { model: db.Brand, as: "brand" },
    ],
    limit,
    offset,
    order: [["flashSaleStart", "ASC"]],
  });

  let upcomingItems = [];
  let nextFlashSaleStart = null;

  if (count === 0) {
    upcomingItems = await db.Product.findAll({
      where: {
        isActive: true,
        isFlashSale: true,
        flashSaleStart: { [Op.gt]: now },
      },
      include: [
        { model: db.Category, as: "category" },
        { model: db.Brand, as: "brand" },
      ],
      limit: 5,
      order: [["flashSaleStart", "ASC"]],
    });

    if (upcomingItems.length > 0) {
      nextFlashSaleStart = upcomingItems[0].flashSaleStart;
    }
  }

  return {
    errCode: 0,
    products: rows.map((p) => {
      const raw = { ...p.toJSON(), image: p.image || null };
      return applyFlashSaleToProduct(raw);
    }),
    totalItems: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
    upcomingProducts: upcomingItems.map((p) => {
      const raw = { ...p.toJSON(), image: p.image || null };
      return applyFlashSaleToProduct(raw);
    }),
    nextFlashSaleStart,
  };
};

const filterProducts = async ({
  brandId,
  categoryId,
  minPrice = 0,
  maxPrice = 99999999,
  search = "",
  sort,
  page = 1,
  limit = 12,
}) => {
  try {
    const conditions = {
      price: { [Op.between]: [minPrice, maxPrice] },
      isActive: true,
    };

    if (brandId) conditions.brandId = brandId;
    if (categoryId) conditions.categoryId = categoryId;
    if (search) conditions.name = { [Op.like]: `%${search}%` };

    // SORT
    let order = [];
    if (sort === "price_asc") order = [["price", "ASC"]];
    if (sort === "price_desc") order = [["price", "DESC"]];
    if (sort === "newest") order = [["createdAt", "DESC"]];

    const offset = (page - 1) * limit;

    const products = await db.Product.findAndCountAll({
      where: conditions,
      include: [
        { model: db.Brand, as: "brand" },
        { model: db.Category, as: "category" },
      ],
      order,
      limit,
      offset,
    });

    return {
      errCode: 0,
      data: products.rows,
      total: products.count,
      page,
      totalPages: Math.ceil(products.count / limit),
    };
  } catch (error) {
    console.error(error);
    return { errCode: 1, errMessage: error.message };
  }
};

const recommendProducts = async (productId, page = 1, limit = 6) => {
  try {
    const product = await db.Product.findByPk(productId);
    if (!product) {
      return { errCode: 1, errMessage: "Product not found" };
    }

    const price = Number(product.price);
    const priceLow = price * 0.8;
    const priceHigh = price * 1.2;

    const where = {
      id: { [Op.ne]: productId },
      isActive: true,
      [Op.or]: [
        { categoryId: product.categoryId },
        { brandId: product.brandId },
        { price: { [Op.between]: [priceLow, priceHigh] } },
      ],
    };

    const total = await db.Product.count({ where });

    const offset = (page - 1) * limit;

    const rows = await db.Product.findAll({
      where,
      include: [
        { model: db.Brand, as: "brand" },
        { model: db.Category, as: "category" },
      ],
      order: [
        ["sold", "DESC"],
        ["discount", "DESC"],
        ["createdAt", "DESC"],
      ],
      offset,
      limit,
    });

    return {
      errCode: 0,
      data: rows.map((p) => p.toJSON()),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (e) {
    console.error("Error recommending products:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const recommendFortuneProducts = async ({
  birthYear,
  brandId,
  minPrice,
  maxPrice,
  categoryId,
  page = 1,
  limit = 6,
  sortBy,
}) => {
  try {
    if (!birthYear) return { errCode: 1, errMessage: "birthYear is required" };

    const luckyColors = getLuckyColorsByYear(Number(birthYear));

    // Build where
    const where = { isActive: true };

    if (luckyColors.length) {
      where.color = { [Op.in]: luckyColors };
    }

    if (brandId) where.brandId = brandId;
    if (categoryId) where.categoryId = categoryId;
    if (minPrice != null) where.price = { ...where.price, [Op.gte]: minPrice };
    if (maxPrice != null) where.price = { ...where.price, [Op.lte]: maxPrice };

    const total = await db.Product.count({ where });
    const offset = (page - 1) * limit;

    let order = [
      ["sold", "DESC"],
      ["createdAt", "DESC"],
    ];
    if (sortBy === "priceAsc") order = [["price", "ASC"]];
    if (sortBy === "priceDesc") order = [["price", "DESC"]];

    const rows = await db.Product.findAll({
      where,
      include: [
        { model: db.Brand, as: "brand" },
        { model: db.Category, as: "category" },
      ],
      order,
      offset,
      limit,
    });

    const data = rows.map((p) => {
      const product = p.toJSON();
      product.isLuckyColor = luckyColors.includes(product.color);
      return product;
    });

    return {
      errCode: 0,
      data,
      luckyColors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (e) {
    console.error("Error in recommendFortuneProducts:", e);
    return { errCode: -1, errMessage: e.message };
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  searchSuggestions,
  updateProductSold,
  getDiscountedProducts,
  getFlashSaleProducts,
  disableExpiredFlashSales,
  filterProducts,
  recommendProducts,
  recommendFortuneProducts,
};
