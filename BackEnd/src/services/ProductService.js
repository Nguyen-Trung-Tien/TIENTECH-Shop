const db = require("../models");
const { Op } = require("sequelize");
const { getLuckyColorsByYear } = require("../utils/fortuneUtils");
const { getCache, setCache, deleteCacheByPattern } = require("../config/redis");
const { getPagination, getPagingData } = require("../utils/paginationHelper");
const AttributeService = require("./AttributeService");
const { slugify } = require("../utils/slugHelper");
const {
  generateEmbedding,
  cosineSimilarity,
} = require("../utils/embeddingHelper");

// --- CÁC HÀM HELPER NỘI BỘ ---

const prepareProductEmbeddingText = (product) => {
  const specs =
    typeof product.specifications === "string"
      ? product.specifications
      : JSON.stringify(product.specifications || {});
  return `Sản phẩm: ${product.name}. Mô tả: ${product.description || ""}. Thông số: ${specs}`.slice(
    0,
    8000,
  );
};

const updateProductEmbedding = async (product, transaction) => {
  try {
    const text = prepareProductEmbeddingText(product);
    const embedding = await generateEmbedding(text);
    if (embedding) {
      await product.update(
        { embedding: JSON.stringify(embedding) },
        { transaction },
      );
    }
  } catch (error) {
    console.error(`Lỗi cập nhật embedding cho SP ${product.id}:`, error);
  }
};

const ensureUniqueSKU = async (sku, transaction) => {
  if (!sku) return `PROD-${Date.now()}`;
  const existing = await db.Product.findOne({
    where: { sku: { [Op.like]: sku } },
    transaction,
  });
  if (existing) return `${sku}-${Date.now()}`;
  return sku;
};

const clearProductCache = async (categoryId = null) => {
  if (categoryId) {
    // Chỉ xóa cache của category cụ thể
    await deleteCacheByPattern(`products_${categoryId}_*`);
  } else {
    // Xóa toàn bộ cache sản phẩm
    await deleteCacheByPattern("products_*");
  }
  // Xóa cache dashboard vì sản phẩm thay đổi ảnh hưởng đến dashboard
  await deleteCacheByPattern("dashboard_*");
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

const ProductVariantService = require("./ProductVariantService");

// ... (existing helper functions) ...

const createProduct = async (data, imageRecords = []) => {
  const t = await db.sequelize.transaction();
  try {
    const { variants, attributes, ...productData } = data;

    // 1. Chuẩn bị dữ liệu sản phẩm chính
    if (!productData.slug && productData.name) {
      productData.slug = `${slugify(productData.name)}-${Date.now()}`;
    }
    productData.sku = await ensureUniqueSKU(productData.sku, t);
    productData.hasVariants = Array.isArray(variants) && variants.length > 0;
    productData.basePrice = Number(productData.basePrice || productData.price || 0);
    
    // Nếu có biến thể, totalStock sẽ được tính từ tổng stock biến thể
    if (productData.hasVariants) {
      productData.totalStock = variants.reduce((sum, v) => sum + Number(v.stock || 0), 0);
    } else {
      productData.totalStock = Number(productData.stock || productData.totalStock || 0);
    }

    // 2. Tạo sản phẩm
    const product = await db.Product.create(productData, { transaction: t });

    // 3. Xử lý Thuộc tính (Attributes) - Many-to-Many
    if (attributes) {
      const attrs = typeof attributes === "string" ? JSON.parse(attributes) : attributes;
      await AttributeService.assignAttributesToProduct(product.id, attrs, t);
    }

    // 4. Xử lý Biến thể (Variants) thông qua Service chuyên biệt
    if (productData.hasVariants) {
      for (const v of variants) {
        await ProductVariantService.createVariant({
          ...v,
          productId: product.id,
          // Đảm bảo truyền đúng trường attributeValues
          attributeValues: v.attributeValues || v.attributes || {}
        }, t);
      }
    }

    // 5. Xử lý Hình ảnh
    if (imageRecords.length > 0) {
      const records = imageRecords.map((img) => ({ ...img, productId: product.id }));
      await db.ProductImage.bulkCreate(records, { transaction: t });
    }

    await t.commit();
    await clearProductCache(product.categoryId);
    return { errCode: 0, product };
  } catch (e) {
    await t.rollback();
    console.error("[ProductService] createProduct Error:", e);
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

    // Đảm bảo trường specifications được lưu đúng định dạng JSON/Object
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

    // Handle Variants if provided
    if (updatedData.variants && Array.isArray(updatedData.variants)) {
      const incomingVariantIds = updatedData.variants
        .filter((v) => v.id)
        .map((v) => v.id);

      // 1. Delete variants not in incoming list
      await db.ProductVariant.destroy({
        where: {
          productId: id,
          id: { [Op.notIn]: incomingVariantIds },
        },
        transaction: t,
      });

      // 2. Upsert (Create or Update) variants
      for (const vData of updatedData.variants) {
        if (vData.id) {
          // Cập nhật biến thể hiện có
          await ProductVariantService.updateVariant(vData.id, vData, t);
        } else {
          // Thêm mới biến thể cho sản phẩm cũ
          await ProductVariantService.createVariant({
            ...vData,
            productId: id,
          }, t);
        }
      }

      // 3. Tính toán lại stock tổng sau khi biến thể thay đổi
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
      // If no variants, just update totalStock from product stock
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
  if (cachedData && !isAdmin) return cachedData; // Không dùng cache cho Admin để đảm bảo dữ liệu mới nhất

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
      {
        model: db.ProductImage,
        as: "images",
        attributes: ["imageUrl", "isPrimary"],
      },
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
      const primary =
        pJSON.images?.find((i) => i.isPrimary) || pJSON.images?.[0];
      return {
        ...applyFlashSaleToProduct(pJSON),
        image: primary?.imageUrl || null,
      };
    }),
    pagination: paginationMetadata,
  };
};

const searchSuggestions = async (query, limit = 8) => {
  const q = (query || "").trim();
  if (!q)
    return {
      errCode: 0,
      suggestions: { products: [], keywords: [], brands: [], categories: [] },
    };

  const productSuggestionsRaw = await db.Product.findAll({
    where: { isActive: true, name: { [Op.like]: `%${q}%` } },
    attributes: [
      "id",
      "name",
      "basePrice",
      "isFlashSale",
      "flashSalePrice",
      "flashSaleStart",
      "flashSaleEnd",
      "sold",
    ],
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
      isFlashSale: processed.flashSaleActive,
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

const filterProducts = async ({
  brandId,
  categoryId,
  brand, // slug
  category, // slug
  minPrice,
  maxPrice,
  search = "",
  sort,
  ram,
  rom,
  screen,
  battery,
  os,
  refresh_rate,
  page = 1,
  limit = 12,
}) => {
  try {
    const conditions = {
      isActive: true,
    };

    if (
      minPrice !== undefined &&
      minPrice !== "" &&
      maxPrice !== undefined &&
      maxPrice !== ""
    ) {
      conditions.basePrice = {
        [Op.between]: [Number(minPrice), Number(maxPrice)],
      };
    } else if (minPrice !== undefined && minPrice !== "") {
      conditions.basePrice = { [Op.gte]: Number(minPrice) };
    } else if (maxPrice !== undefined && maxPrice !== "") {
      conditions.basePrice = { [Op.lte]: Number(maxPrice) };
    }

    // Xử lý brandId hoặc brand slug
    if (brandId && brandId !== "") {
      const brandIds = Array.isArray(brandId)
        ? brandId
        : String(brandId).split(",").map(id => Number(id.trim()));
      conditions.brandId = { [Op.in]: brandIds };
    } else if (brand && brand !== "") {
      const brandSlugs = Array.isArray(brand)
        ? brand
        : String(brand).split(",").map(s => s.trim());
      const brandData = await db.Brand.findAll({ where: { slug: { [Op.in]: brandSlugs } } });
      if (brandData.length > 0) conditions.brandId = { [Op.in]: brandData.map(b => b.id) };
    }

    // Xử lý categoryId hoặc category slug
    if (categoryId && categoryId !== "") {
      conditions.categoryId = Number(categoryId);
    } else if (category && category !== "") {
      const categoryData = await db.Category.findOne({ where: { slug: category } });
      if (categoryData) conditions.categoryId = categoryData.id;
    }

    if (search && search !== "") conditions.name = { [Op.like]: `%${search}%` };

    const filterParams = { ram, rom, screen, battery, os, refresh_rate };
    const filterValues = [];
    Object.keys(filterParams).forEach((key) => {
      if (filterParams[key] && filterParams[key] !== "") {
        const vals = Array.isArray(filterParams[key])
          ? filterParams[key]
          : String(filterParams[key]).split(",").map(v => v.trim());
        filterValues.push(...vals);
      }
    });

    const include = [
      { model: db.Brand, as: "brand" },
      { model: db.Category, as: "category" },
      {
        model: db.ProductImage,
        as: "images",
        attributes: ["imageUrl", "isPrimary"],
      },
    ];

    if (filterValues.length > 0) {
      include.push({
        model: db.AttributeValue,
        as: "attributes",
        where: { value: { [Op.in]: filterValues } },
        through: { attributes: [] },
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
        const primary =
          pJSON.images?.find((i) => i.isPrimary) || pJSON.images?.[0];
        return {
          ...applyFlashSaleToProduct(pJSON),
          image: primary?.imageUrl || null,
        };
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

    const pagingData = getPagingData({ count, rows }, page, l);
    const { items, ...paginationMetadata } = pagingData;

    return {
      errCode: 0,
      data: items.map((p) => {
        const pJSON = p.toJSON();
        const primary =
          pJSON.images?.find((i) => i.isPrimary) || pJSON.images?.[0];
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
  try {
    const now = new Date();
    const { offset, limit: l } = getPagination(page, limit);
    
    // Lấy sản phẩm đang Flash Sale
    const activeData = await db.Product.findAndCountAll({
      where: {
        isActive: true,
        isFlashSale: true,
        flashSaleStart: { [Op.lte]: now },
        flashSaleEnd: { [Op.gte]: now },
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

    // Lấy sản phẩm sắp Flash Sale (trong vòng 24h tới)
    const upcomingData = await db.Product.findAll({
      where: {
        isActive: true,
        isFlashSale: true,
        flashSaleStart: { 
          [Op.gt]: now,
          [Op.lte]: new Date(now.getTime() + 24 * 60 * 60 * 1000) 
        },
      },
      include: [
        {
          model: db.ProductImage,
          as: "images",
          attributes: ["imageUrl", "isPrimary"],
        },
      ],
      limit: 6,
      order: [["flashSaleStart", "ASC"]],
    });

    const pagingData = getPagingData(activeData, page, l);

    // Tìm thời điểm bắt đầu của đợt Flash Sale tiếp theo
    const nextFlashSale = await db.Product.findOne({
      where: {
        isActive: true,
        isFlashSale: true,
        flashSaleStart: { [Op.gt]: now },
      },
      order: [["flashSaleStart", "ASC"]],
      attributes: ["flashSaleStart"],
    });

    const products = pagingData.items.map((p) => {
      const pJSON = p.toJSON();
      const primary = pJSON.images?.find((i) => i.isPrimary) || pJSON.images?.[0];
      return applyFlashSaleToProduct({
        ...pJSON,
        image: primary?.imageUrl || null,
      });
    });

    const upcomingProducts = upcomingData.map((p) => {
      const pJSON = p.toJSON();
      const primary = pJSON.images?.find((i) => i.isPrimary) || pJSON.images?.[0];
      return {
        ...pJSON,
        image: primary?.imageUrl || null,
      };
    });

    return {
      errCode: 0,
      products,
      upcomingProducts,
      nextFlashSaleStart: nextFlashSale ? nextFlashSale.flashSaleStart : null,
      pagination: {
        totalItems: pagingData.totalItems,
        totalPages: pagingData.totalPages,
        currentPage: pagingData.currentPage,
      },
      // Thêm các trường này cho tương thích ngược với FrontEnd cũ nếu cần
      currentPage: pagingData.currentPage,
      totalPages: pagingData.totalPages
    };
  } catch (error) {
    console.error("Error in getFlashSaleProducts:", error);
    return { errCode: 1, errMessage: error.message };
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
  const { items, ...paginationMetadata } = pagingData;

  return {
    errCode: 0,
    products: items.map((p) => {
      const pJSON = p.toJSON();
      const primary =
        pJSON.images?.find((i) => i.isPrimary) || pJSON.images?.[0];
      return applyFlashSaleToProduct({
        ...pJSON,
        image: primary?.imageUrl || null,
      });
    }),
    pagination: paginationMetadata,
  };
};

const recommendFortuneProducts = async ({
  birthYear,
  brandId,
  minPrice,
  maxPrice,
  categoryId,
  page = 1,
  limit = 6,
}) => {
  try {
    const luckyColors = getLuckyColorsByYear(Number(birthYear));
    const where = { isActive: true };
    if (luckyColors.length) {
      where[Op.or] = luckyColors.map((color) => ({
        specifications: { [Op.like]: `%${color}%` },
      }));
    }
    if (brandId) where.brandId = brandId;
    if (categoryId) where.categoryId = categoryId;
    if (minPrice != null)
      where.basePrice = { ...where.basePrice, [Op.gte]: minPrice };
    if (maxPrice != null)
      where.basePrice = { ...where.basePrice, [Op.lte]: maxPrice };

    const { offset, limit: l } = getPagination(page, limit);
    const { count, rows } = await db.Product.findAndCountAll({
      where,
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

    const pagingData = getPagingData({ count, rows }, page, l);
    const { items, ...paginationMetadata } = pagingData;

    return {
      errCode: 0,
      data: items.map((p) => {
        const pJSON = p.toJSON();
        const primary =
          pJSON.images?.find((i) => i.isPrimary) || pJSON.images?.[0];
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

const searchSemanticProducts = async (query, limit = 5) => {
  try {
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding)
      return {
        errCode: 1,
        errMessage: "Không thể tạo embedding cho truy vấn.",
      };

    // Lấy tất cả sản phẩm có embedding (Trong thực tế nên dùng Vector DB nếu dữ liệu lớn)
    const products = await db.Product.findAll({
      where: {
        isActive: true,
        embedding: { [Op.ne]: null },
      },
      attributes: ["id", "name", "basePrice", "discount", "embedding", "description"],
    });

    const results = products
      .map((product) => {
        const productEmbedding = JSON.parse(product.embedding);
        const similarity = cosineSimilarity(queryEmbedding, productEmbedding);
        return {
          id: product.id,
          name: product.name,
          price: product.basePrice * (1 - (product.discount || 0) / 100),
          image: null,
          similarity: similarity,
        };
      })
      .filter((p) => p.similarity > 0.3) // Ngưỡng tương đồng tối thiểu
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return { errCode: 0, products: results };
  } catch (e) {
    console.error("Lỗi tìm kiếm ngữ nghĩa:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const syncAllProductEmbeddings = async () => {
  const products = await db.Product.findAll();
  let count = 0;
  for (const product of products) {
    await updateProductEmbedding(product);
    count++;
    if (count % 10 === 0)
      console.log(`Đã đồng bộ ${count}/${products.length} sản phẩm...`);
  }
  return { errCode: 0, message: `Đã đồng bộ xong ${count} sản phẩm.` };
};

const getSmartRecommendations = async (productId, limit = 6) => {
  try {
    const product = await db.Product.findByPk(productId);
    if (!product) return { errCode: 1, errMessage: "Sản phẩm không tồn tại" };

    // 1) Semantic similarity from embedding
    let semanticMatches = [];
    if (product.embedding) {
      const queryEmbedding = JSON.parse(product.embedding);
      const allProducts = await db.Product.findAll({
        where: {
          isActive: true,
          id: { [Op.ne]: productId },
          embedding: { [Op.ne]: null },
        },
        attributes: ["id", "name", "slug", "basePrice", "discount", "embedding"],
        include: [
          {
            model: db.ProductImage,
            as: "images",
            attributes: ["imageUrl", "isPrimary"],
          },
        ],
      });

      semanticMatches = allProducts
        .map((p) => {
          const plain = p.get({ plain: true });
          const primary = plain.images?.find((img) => img.isPrimary) || plain.images?.[0];
          return {
            id: plain.id,
            name: plain.name,
            slug: plain.slug,
            basePrice: plain.basePrice,
            discount: plain.discount,
            image: primary?.imageUrl || null,
            similarity: cosineSimilarity(queryEmbedding, JSON.parse(plain.embedding)),
            reason: "Cùng phong cách",
          };
        })
        .filter((p) => p.similarity > 0.7)
        .sort((a, b) => b.similarity - a.similarity);
    }

    // 2) Frequently bought together
    const orderItems = await db.OrderItem.findAll({
      where: { productId },
      attributes: ["orderId"],
      raw: true,
    });
    const orderIds = orderItems.map((item) => item.orderId);

    let boughtTogether = [];
    if (orderIds.length > 0) {
      const frequentProductData = await db.OrderItem.findAll({
        where: {
          orderId: { [Op.in]: orderIds },
          productId: { [Op.ne]: productId },
        },
        attributes: [
          "productId",
          [db.sequelize.fn("COUNT", db.sequelize.col("productId")), "count"],
        ],
        group: ["productId"],
        order: [[db.sequelize.literal("count"), "DESC"]],
        limit: limit,
        raw: true,
        subQuery: false,
      });

      const productIds = frequentProductData.map((item) => item.productId);
      if (productIds.length > 0) {
        const products = await db.Product.findAll({
          where: { id: { [Op.in]: productIds } },
          attributes: ["id", "name", "slug", "basePrice", "discount"],
          include: [
            {
              model: db.ProductImage,
              as: "images",
              attributes: ["imageUrl", "isPrimary"],
            },
          ],
        });

        const productMap = new Map();
        products.forEach((p) => {
          const plain = p.get({ plain: true });
          const primary = plain.images?.find((img) => img.isPrimary) || plain.images?.[0];
          productMap.set(plain.id, {
            id: plain.id,
            name: plain.name,
            slug: plain.slug,
            basePrice: plain.basePrice,
            discount: plain.discount,
            image: primary?.imageUrl || null,
          });
        });

        boughtTogether = frequentProductData
          .map((item) => {
            const productInfo = productMap.get(item.productId);
            return productInfo ? { ...productInfo, reason: "Thường mua cùng" } : null;
          })
          .filter(Boolean);
      }
    }

    // Merge + dedupe
    const combined = [...boughtTogether, ...semanticMatches];
    const uniqueResults = [];
    const seenIds = new Set();

    for (const p of combined) {
      if (!seenIds.has(p.id)) {
        uniqueResults.push(p);
        seenIds.add(p.id);
      }
      if (uniqueResults.length >= limit) break;
    }

    // 3) Fallback by same category
    if (uniqueResults.length < limit) {
      const fallback = await db.Product.findAll({
        where: {
          categoryId: product.categoryId,
          id: {
            [Op.and]: [
              { [Op.ne]: productId },
              { [Op.notIn]: Array.from(seenIds) },
            ],
          },
          isActive: true,
        },
        limit: limit - uniqueResults.length,
        attributes: ["id", "name", "slug", "basePrice", "discount"],
        include: [
          {
            model: db.ProductImage,
            as: "images",
            attributes: ["imageUrl", "isPrimary"],
          },
        ],
      });

      fallback.forEach((p) => {
        const plain = p.get({ plain: true });
        const primary = plain.images?.find((img) => img.isPrimary) || plain.images?.[0];
        uniqueResults.push({
          id: plain.id,
          name: plain.name,
          slug: plain.slug,
          basePrice: plain.basePrice,
          discount: plain.discount,
          image: primary?.imageUrl || null,
          reason: "Cùng danh mục",
        });
      });
    }

    return { errCode: 0, products: uniqueResults };
  } catch (e) {
    console.error("Lỗi getSmartRecommendations:", e);
    return { errCode: 1, errMessage: e.message };
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
  filterProducts,
  getProductBySlug,
  recommendProducts,
  getFlashSaleProducts,
  getDiscountedProducts,
  disableExpiredFlashSales,
  recommendFortuneProducts,
  searchSemanticProducts,
  syncAllProductEmbeddings,
  getSmartRecommendations,
};
