const db = require("../models");
const { Op } = require("sequelize");
const { getLuckyColorsByYear } = require("../utils/fortuneUtils");
const NodeCache = require("node-cache");
const { getPagination, getPagingData } = require("../utils/paginationHelper");

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

const createProduct = async (data, imageRecords = []) => {
  const t = await db.sequelize.transaction();
  try {
    const newData = { ...data };

    // Xử lý specifications và đồng bộ legacy fields
    if (newData.specifications) {
      const specs =
        typeof newData.specifications === "string"
          ? JSON.parse(newData.specifications)
          : newData.specifications;

      newData.cpu = specs.cpu || newData.cpu;
      newData.ram = specs.ram || newData.ram;
      newData.rom = specs.rom || newData.rom;
      newData.screen = specs.screen || newData.screen;
      newData.battery = specs.battery || newData.battery;
      newData.os = specs.os || newData.os;
      newData.weight = specs.weight || newData.weight;
      newData.connectivity = specs.connectivity || newData.connectivity;
    }

    // Auto-generate slug
    if (!newData.slug && newData.name) {
      newData.slug = `${slugify(newData.name)}-${Date.now()}`;
    }

    // Gán basePrice ban đầu bằng price nếu chưa có
    newData.basePrice = newData.basePrice || newData.price || 0;
    // Map stock -> totalStock (Vì UI có thể gửi trường stock)
    if (newData.stock !== undefined) {
      newData.totalStock = Number(newData.stock);
    }

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
    attributes: {
      include: ["hasVariants"],
    },
    include: [
      { model: db.Category, as: "category" },
      { model: db.Brand, as: "brand" },
      { model: db.Review, as: "reviews" },
      {
        model: db.ProductImage,
        as: "images",
        attributes: ["imageUrl", "isPrimary"],
      },
    ],
    limit: l,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const pagingData = getPagingData(data, page, l);

  const result = {
    errCode: 0,
    products: pagingData.items.map((p) => {
      let image = p.image;
      if (!image && p.images && p.images.length > 0) {
        const primary = p.images.find((i) => i.isPrimary) || p.images[0];
        image = primary.imageUrl;
      }
      const raw = { ...p.toJSON(), image: image || null };
      return applyFlashSaleToProduct(raw);
    }),
    pagination: {
      totalItems: pagingData.totalItems,
      currentPage: pagingData.currentPage,
      totalPages: pagingData.totalPages,
      limit: l,
    },
  };

  // Flash sale sản phẩm dùng TTL ngắn hơn (60s) vì giá thay đổi theo phút
  productCache.set(cacheKey, result, isFlashSale ? 60 : 600);
  return result;
};

const getProductById = async (id) => {
  try {
    const product = await db.Product.findByPk(id, {
      attributes: {
        include: ["hasVariants"],
      },
      include: [
        { model: db.Category, as: "category" },
        { model: db.Brand, as: "brand" },
        {
          model: db.ProductImage,
          as: "images",
          attributes: ["id", "imageUrl", "isPrimary", "variantId"],
        },
        {
          model: db.ProductVariant,
          as: "variants",
          include: [
            {
              model: db.ProductImage,
              as: "images",
              attributes: ["id", "imageUrl", "isPrimary"],
            },
          ],
          attributes: [
            "id",
            "sku",
            "price",
            "stock",
            "isActive",
            "attributeValues",
            "specifications",
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

    let mainImage = product.image;
    if (!mainImage && images.length > 0) {
      const primary = images.find((i) => i.isPrimary) || images[0];
      mainImage = primary.imageUrl;
    }

    const formattedProduct = applyFlashSaleToProduct({
      ...product.toJSON(),
      image: mainImage || null,
      sold: product.sold || 0,
      images: images.map((i) => ({
        id: i.id,
        imageUrl: i.imageUrl,
        isPrimary: i.isPrimary,
      })),
      variants: product.variants?.map((v) => {
        const plainV = v.get({ plain: true });
        return {
          ...plainV,
          imageUrl: plainV.images?.[0]?.imageUrl || null,
        };
      }),
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

    // Xử lý specifications và đồng bộ legacy fields
    if (updatedData.specifications) {
      const specs =
        typeof updatedData.specifications === "string"
          ? JSON.parse(updatedData.specifications)
          : updatedData.specifications;

      updatedData.cpu = specs.cpu || updatedData.cpu;
      updatedData.ram = specs.ram || updatedData.ram;
      updatedData.rom = specs.rom || updatedData.rom;
      updatedData.screen = specs.screen || updatedData.screen;
      updatedData.battery = specs.battery || updatedData.battery;
      updatedData.os = specs.os || updatedData.os;
      updatedData.weight = specs.weight || updatedData.weight;
      updatedData.connectivity = specs.connectivity || updatedData.connectivity;
    }

    // Re-generate slug if name changes and no slug provided
    if (
      updatedData.name &&
      updatedData.name !== product.name &&
      !updatedData.slug
    ) {
      updatedData.slug = `${slugify(updatedData.name)}-${product.id}`;
    }

    // Map stock -> totalStock
    if (updatedData.stock !== undefined) {
      updatedData.totalStock = Number(updatedData.stock);
    }

    const updatedProduct = await product.update(updatedData, {
      transaction: t,
    });

    // Nếu sản phẩm có variants, cập nhật lại totalStock của product cha dựa trên tổng stock các variant
    const variants = await db.ProductVariant.findAll({
      where: { productId: id },
      transaction: t,
    });
    if (variants && variants.length > 0) {
      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      await product.update({ totalStock }, { transaction: t });
    }

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
    clearProductCache();
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
    clearProductCache();
    return { errCode: 0, errMessage: "Product deleted successfully" };
  } catch (e) {
    console.error("Error deleting product:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const searchProducts = async (query, page = 1, limit = 10) => {
  const { offset, limit: l } = getPagination(page, limit);
  const { Op } = db.Sequelize;

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
      {
        model: db.ProductImage,
        as: "images",
        attributes: ["imageUrl", "isPrimary"],
      }
    ],
    limit: l,
    offset,
    order: [["id", "DESC"]],
  });

  const pagingData = getPagingData(data, page, l);

  return {
    errCode: 0,
    products: pagingData.items.map((p) => {
      let image = p.image;
      if (!image && p.images && p.images.length > 0) {
        const primary = p.images.find((i) => i.isPrimary) || p.images[0];
        image = primary.imageUrl;
      }
      return { ...applyFlashSaleToProduct(p.toJSON()), image: image || null };
    }),
    pagination: {
      totalItems: pagingData.totalItems,
      currentPage: pagingData.currentPage,
      totalPages: pagingData.totalPages,
      limit: l,
    }
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

  // Sử dụng LIKE đơn giản để tránh lỗi SQL phức tạp
  const productSuggestionsRaw = await db.Product.findAll({
    where: { 
      isActive: true,
      name: { [Op.like]: `%${q}%` } 
    },
    attributes: ["id", "name", "basePrice", "isFlashSale", "flashSalePrice", "flashSaleStart", "flashSaleEnd", "sold"],
    include: [
      {
        model: db.ProductImage,
        as: "images",
        attributes: ["imageUrl", "isPrimary"],
      },
    ],
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

  const brandSuggestions = await db.Brand.findAll({
    where: { name: { [Op.like]: `%${q}%` } },
    attributes: ["id", "name"],
    limit: 3,
  });

  const categorySuggestions = await db.Category.findAll({
    where: { name: { [Op.like]: `%${q}%` } },
    attributes: ["id", "name"],
    limit: 3,
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

/**
 * @deprecated Không gọi hàm này từ bên ngoài — stock và sold được quản lý bởi createOrder/updateOrderStatus.
 * Hàm này chỉ giữ lại để tương thích ngược.
 */
const updateProductSold = async (productId, quantity) => {
  console.warn(
    "[DEPRECATED] updateProductSold should not be called — stock is managed by order flow.",
  );
  try {
    const product = await db.Product.findByPk(productId);
    if (!product) return { errCode: 1, errMessage: "Product not found" };

    await product.increment("sold", { by: quantity });
    await product.decrement("totalStock", { by: quantity });

    return { errCode: 0, errMessage: "Updated product sold count" };
  } catch (e) {
    console.error("Error updating sold count:", e);
    return { errCode: 1, errMessage: e.message };
  }
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
    attributes: {
      include: ["hasVariants"],
    },
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
  });

  const pagingData = getPagingData(data, page, l);

  return {
    errCode: 0,
    products: pagingData.items.map((p) => {
      let image = p.image;
      if (!image && p.images && p.images.length > 0) {
        const primary = p.images.find((i) => i.isPrimary) || p.images[0];
        image = primary.imageUrl;
      }
      const raw = { ...p.toJSON(), image: image || null };
      return applyFlashSaleToProduct(raw);
    }),
    pagination: {
      totalItems: pagingData.totalItems,
      currentPage: pagingData.currentPage,
      totalPages: pagingData.totalPages,
      limit: l,
    },
  };
};

const getFlashSaleProducts = async (page = 1, limit = 10) => {
  const now = new Date();
  const { offset, limit: l } = getPagination(page, limit);

  const data = await db.Product.findAndCountAll({
    where: {
      isActive: true,
      isFlashSale: true,
      flashSaleStart: { [Op.lte]: now },
      flashSaleEnd: { [Op.gte]: now },
    },
    attributes: {
      include: ["hasVariants"],
    },
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
    order: [["flashSaleStart", "ASC"]],
  });

  const pagingData = getPagingData(data, page, l);

  let upcomingItems = [];
  let nextFlashSaleStart = null;

  if (pagingData.totalItems === 0) {
    upcomingItems = await db.Product.findAll({
      where: {
        isActive: true,
        isFlashSale: true,
        flashSaleStart: { [Op.gt]: now },
      },
      attributes: {
        include: ["hasVariants"],
      },
      include: [
        { model: db.Category, as: "category" },
        { model: db.Brand, as: "brand" },
        {
          model: db.ProductImage,
          as: "images",
          attributes: ["imageUrl", "isPrimary"],
        },
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
    products: pagingData.items.map((p) => {
      let image = p.image;
      if (!image && p.images && p.images.length > 0) {
        const primary = p.images.find((i) => i.isPrimary) || p.images[0];
        image = primary.imageUrl;
      }
      const raw = { ...p.toJSON(), image: image || null };
      return applyFlashSaleToProduct(raw);
    }),
    pagination: {
      totalItems: pagingData.totalItems,
      currentPage: pagingData.currentPage,
      totalPages: pagingData.totalPages,
      limit: l,
    },
    upcomingProducts: upcomingItems.map((p) => {
      let image = p.image;
      if (!image && p.images && p.images.length > 0) {
        const primary = p.images.find((i) => i.isPrimary) || p.images[0];
        image = primary.imageUrl;
      }
      const raw = { ...p.toJSON(), image: image || null };
      return applyFlashSaleToProduct(raw);
    }),
    nextFlashSaleStart,
  };
};

const recommendProducts = async (productId, page = 1, limit = 6) => {
  try {
    const product = await db.Product.findByPk(productId);
    if (!product) {
      return { errCode: 1, errMessage: "Product not found" };
    }

    const price = Number(product.basePrice);
    const priceLow = price * 0.8;
    const priceHigh = price * 1.2;

    const where = {
      id: { [Op.ne]: productId },
      isActive: true,
      [Op.or]: [
        { categoryId: product.categoryId },
        { brandId: product.brandId },
        { basePrice: { [Op.between]: [priceLow, priceHigh] } },
      ],
    };

    const total = await db.Product.count({ where });

    const { offset, limit: l } = getPagination(page, limit);

    const rows = await db.Product.findAll({
      where,
      attributes: {
        include: ["hasVariants"],
      },
      include: [
        { model: db.Brand, as: "brand" },
        { model: db.Category, as: "category" },
        {
          model: db.ProductImage,
          as: "images",
          attributes: ["imageUrl", "isPrimary"],
        },
      ],
      order: [
        ["sold", "DESC"],
        ["createdAt", "DESC"],
      ],
      offset,
      limit: l,
    });

    return {
      errCode: 0,
      data: rows.map((p) => {
        let image = p.image;
        if (!image && p.images && p.images.length > 0) {
          const primary = p.images.find((i) => i.isPrimary) || p.images[0];
          image = primary.imageUrl;
        }
        return { ...p.toJSON(), image: image || null };
      }),
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / l),
        totalItems: total,
        limit: l,
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
      // Filter by color in specifications JSON field
      where[Op.or] = luckyColors.map((color) => ({
        specifications: {
          [Op.like]: `%${color}%`,
        },
      }));
    }

    if (brandId) where.brandId = brandId;
    if (categoryId) where.categoryId = categoryId;
    if (minPrice != null)
      where.basePrice = { ...where.basePrice, [Op.gte]: minPrice };
    if (maxPrice != null)
      where.basePrice = { ...where.basePrice, [Op.lte]: maxPrice };

    const total = await db.Product.count({ where });
    const { offset, limit: l } = getPagination(page, limit);

    let order = [
      ["sold", "DESC"],
      ["createdAt", "DESC"],
    ];
    if (sortBy === "priceAsc") order = [["basePrice", "ASC"]];
    if (sortBy === "priceDesc") order = [["basePrice", "DESC"]];

    const rows = await db.Product.findAll({
      where,
      attributes: {
        include: ["hasVariants"],
      },
      include: [
        { model: db.Brand, as: "brand" },
        { model: db.Category, as: "category" },
        {
          model: db.ProductImage,
          as: "images",
          attributes: ["imageUrl", "isPrimary"],
        },
      ],
      order,
      offset,
      limit: l,
    });

    const data = rows.map((p) => {
      let image = p.image;
      if (!image && p.images && p.images.length > 0) {
        const primary = p.images.find((i) => i.isPrimary) || p.images[0];
        image = primary.imageUrl;
      }
      const product = p.toJSON();
      product.image = image || null;
      product.isLuckyColor = luckyColors.includes(product.color);
      return product;
    });

    return {
      errCode: 0,
      data,
      luckyColors,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / l),
        totalItems: total,
        limit: l,
      },
    };
  } catch (e) {
    console.error("Error in recommendFortuneProducts:", e);
    return { errCode: -1, errMessage: e.message };
  }
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
    // Dùng basePrice (cột thực tế trong DB), không phải price (đã xoá)
    const conditions = {
      basePrice: { [Op.between]: [Number(minPrice), Number(maxPrice)] },
      isActive: true,
    };

    if (brandId) conditions.brandId = Number(brandId);
    if (categoryId) conditions.categoryId = Number(categoryId);
    if (search) conditions.name = { [Op.like]: `%${search}%` };

    // SORT — dùng basePrice thay vì price
    let order = [];
    if (sort === "price_asc") order = [["basePrice", "ASC"]];
    if (sort === "price_desc") order = [["basePrice", "DESC"]];
    if (sort === "newest") order = [["createdAt", "DESC"]];

    const { offset, limit: l } = getPagination(page, limit);

    const data = await db.Product.findAndCountAll({
      where: conditions,
      attributes: {
        include: ["hasVariants"],
      },
      include: [
        { model: db.Brand, as: "brand" },
        { model: db.Category, as: "category" },
        {
          model: db.ProductImage,
          as: "images",
          attributes: ["imageUrl", "isPrimary"],
        },
      ],
      order,
      limit: l,
      offset,
    });

    const pagingData = getPagingData(data, page, l);

    return {
      errCode: 0,
      data: pagingData.items.map((p) => {
        let image = p.image;
        if (!image && p.images && p.images.length > 0) {
          const primary = p.images.find((i) => i.isPrimary) || p.images[0];
          image = primary.imageUrl;
        }
        return { ...p.toJSON(), image: image || null };
      }),
      pagination: {
        totalItems: pagingData.totalItems,
        currentPage: pagingData.currentPage,
        totalPages: pagingData.totalPages,
        limit: l,
      },
    };
  } catch (error) {
    console.error(error);
    return { errCode: 1, errMessage: error.message };
  }
};

const getProductBySlug = async (slug) => {
  try {
    let product = await db.Product.findOne({
      where: { slug, isActive: true },
      attributes: {
        include: ["hasVariants"],
      },
      include: [
        { model: db.Category, as: "category", attributes: ["id", "name"] },
        { model: db.Brand, as: "brand", attributes: ["id", "name"] },
        {
          model: db.ProductImage,
          as: "images",
          attributes: ["id", "imageUrl", "isPrimary"],
        },
        {
          model: db.ProductVariant,
          as: "variants",
          where: { isActive: true },
          required: false,
          include: [
            {
              model: db.ProductImage,
              as: "images",
              attributes: ["id", "imageUrl", "isPrimary"],
            },
          ],
          attributes: [
            "id",
            "sku",
            "price",
            "stock",
            "attributeValues",
            "specifications",
          ],
        },
      ],
    });

    // Fallback: If not found by slug, try searching by ID
    if (!product && !isNaN(slug)) {
      product = await db.Product.findOne({
        where: { id: parseInt(slug), isActive: true },
        attributes: {
          include: ["hasVariants"],
        },
        include: [
          { model: db.Category, as: "category", attributes: ["id", "name"] },
          { model: db.Brand, as: "brand", attributes: ["id", "name"] },
          {
            model: db.ProductImage,
            as: "images",
            attributes: ["id", "imageUrl", "isPrimary", "variantId"],
          },
          {
            model: db.ProductVariant,
            as: "variants",
            where: { isActive: true },
            required: false,
            include: [
              {
                model: db.ProductImage,
                as: "images",
                attributes: ["id", "imageUrl", "isPrimary"],
              },
            ],
            attributes: [
              "id",
              "sku",
              "price",
              "stock",
              "attributeValues",
              "specifications",
            ],
          },
        ],
      });
    }

    if (!product) return { errCode: 1, errMessage: "Product not found" };

    const plainProduct = product.get({ plain: true });
    const variants = plainProduct.variants || [];

    // 1. Tính toán giá min/max
    const prices = variants.map((v) => Number(v.price));
    const minPrice =
      prices.length > 0 ? Math.min(...prices) : Number(plainProduct.basePrice);
    const maxPrice =
      prices.length > 0 ? Math.max(...prices) : Number(plainProduct.basePrice);

    // 2. Tính tổng tồn kho
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

    // 3. Logic Flash Sale Real-time
    const now = new Date();
    const isFlashSaleActive =
      plainProduct.isFlashSale &&
      plainProduct.flashSaleStart &&
      plainProduct.flashSaleEnd &&
      now >= new Date(plainProduct.flashSaleStart) &&
      now <= new Date(plainProduct.flashSaleEnd);

    const primaryImage =
      plainProduct.images?.find((img) => img.isPrimary) ||
      plainProduct.images?.[0];

    // 4. Clean DTO
    const productDTO = {
      id: plainProduct.id,
      name: plainProduct.name,
      slug: plainProduct.slug,
      image: primaryImage ? primaryImage.imageUrl : null,
      description: plainProduct.description,
      specifications: plainProduct.specifications,
      price: plainProduct.basePrice, // Giá gốc (base)
      discount: plainProduct.discount || 0, // % giảm giá (legacy)
      brand: plainProduct.brand,
      category: plainProduct.category,
      images: plainProduct.images?.sort((a, b) => (b.isPrimary ? 1 : -1)) || [],
      variants: variants.map((v) => ({
        ...v,
        imageUrl: v.images?.[0]?.imageUrl || null,
      })),

      // Computed fields
      priceRange: {
        min: minPrice,
        max: maxPrice,
        display:
          minPrice === maxPrice ? `${minPrice}` : `${minPrice} - ${maxPrice}`,
      },
      totalStock,
      flashSale: {
        isActive: isFlashSaleActive,
        price: isFlashSaleActive ? Number(plainProduct.flashSalePrice) : null,
        endDate: isFlashSaleActive ? plainProduct.flashSaleEnd : null,
      },
      sold: plainProduct.sold,
    };

    return {
      errCode: 0,
      product: productDTO,
    };
  } catch (e) {
    console.error("Error fetching product by slug:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const createProductWithVariants = async (data, imageRecords = []) => {
  const t = await db.sequelize.transaction();
  try {
    const { options, variants: customVariants, ...productData } = data;

    // 1. Create Product
    if (!productData.slug && productData.name) {
      const slugify = require("slugify");
      productData.slug = `${slugify(productData.name, { lower: true, locale: "vi" })}-${Date.now()}`;
    }
    productData.hasVariants = customVariants && customVariants.length > 0;

    // Map stock -> totalStock cho sản phẩm cha
    if (productData.stock !== undefined) {
      productData.totalStock = Number(productData.stock);
    }

    const product = await db.Product.create(productData, { transaction: t });

    // 2. Handle Variants
    if (productData.hasVariants) {
      let finalTotalStock = 0;

      for (const variant of customVariants) {
        const variantStock = Number(variant.stock || 0);
        finalTotalStock += variantStock;

        await db.ProductVariant.create(
          {
            productId: product.id,
            sku:
              variant.sku ||
              `${product.sku || product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            price: variant.price || product.basePrice,
            stock: variantStock,
            attributeValues: variant.attributeValues || {},
            specifications: variant.specifications || {},
            isActive: true,
          },
          { transaction: t },
        );
      }

      // Cập nhật lại totalStock cho sản phẩm cha dựa trên các biến thể vừa tạo
      await product.update({ totalStock: finalTotalStock }, { transaction: t });
    }

    // 3. Handle Images
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

const getProductBySlugPublic = async (slug) => {
  try {
    const result = await getProductBySlug(slug);
    return result;
  } catch (e) {
    return { errCode: 1, errMessage: e.message };
  }
};

module.exports = {
  createProduct,
  createProductWithVariants,
  getAllProducts,
  getProductById,
  getProductBySlug,
  getProductBySlugPublic,
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
