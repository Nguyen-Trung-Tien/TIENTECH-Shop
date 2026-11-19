const db = require("../../models");
const { Op } = require("sequelize");
const { getPagination, getPagingData } = require("../../utils/paginationHelper");
const { applyFlashSaleToProduct } = require("./productHelper");
const VectorIndexService = require("../ai/VectorIndexService");
const HybridSearchService = require("../ai/HybridSearchService");
const EmbeddingSyncService = require("../ai/EmbeddingSyncService");

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
    attributes: { exclude: ["embedding"] },
    include: [
      { model: db.Category, as: "category" },
      { model: db.Brand, as: "brand" },
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
    limit: l,
    offset,
    order: [["id", "DESC"]],
    distinct: true,
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
    where: {
      isActive: true,
      [Op.or]: [
        { name: { [Op.like]: `%${q}%` } },
        { sku: { [Op.like]: `%${q}%` } },
      ],
    },
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
      isSemanticMatch: false,
    };
  });

  if (productSuggestions.length < Math.min(limit, 4) && VectorIndexService.count > 0) {
    try {
      const hybridRes = await HybridSearchService.search(q, { limit });
      const seenIds = new Set(productSuggestions.map((item) => Number(item.id)));
      for (const item of hybridRes?.products || []) {
        if (productSuggestions.length >= limit) break;
        const pid = Number(item.id);
        if (seenIds.has(pid)) continue;
        seenIds.add(pid);
        productSuggestions.push({
          id: pid,
          name: item.name,
          price: item.displayPrice ?? item.price ?? item.basePrice,
          originalPrice: item.basePrice,
          discount: item.flashSaleDiscount ?? item.discount ?? 0,
          image: item.image || null,
          isFlashSale: Boolean(item.flashSaleActive),
          isSemanticMatch: true,
        });
      }
    } catch {
      // Non-blocking fallback to lexical suggestions only
    }
  }

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
  brand,
  category,
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
  isFlashSale,
  isAdmin,
}) => {
  try {
    const conditions = {};
    
    // Nếu không phải admin thì chỉ lấy sản phẩm đang active
    const isAdminBool = isAdmin === true || isAdmin === "true" || isAdmin === 1 || isAdmin === "1";
    if (!isAdminBool) {
      conditions.isActive = true;
    }

    const isFlashSaleBool = isFlashSale === true || isFlashSale === "true" || isFlashSale === 1 || isFlashSale === "1";
    if (isFlashSaleBool) {
      conditions.isFlashSale = true;
      if (!isAdminBool) {
        const now = new Date();
        conditions[Op.and] = [
          ...(conditions[Op.and] || []),
          {
            [Op.or]: [
              { flashSaleStart: null },
              { flashSaleStart: { [Op.lte]: now } },
            ],
          },
          {
            [Op.or]: [
              { flashSaleEnd: null },
              { flashSaleEnd: { [Op.gte]: now } },
            ],
          },
        ];
      }
    }

    const hasMinPrice = minPrice !== undefined && minPrice !== "" && minPrice !== null;
    const hasMaxPrice = maxPrice !== undefined && maxPrice !== "" && maxPrice !== null;

    if (hasMinPrice && hasMaxPrice) {
      conditions.basePrice = {
        [Op.between]: [Number(minPrice), Number(maxPrice)],
      };
    } else if (hasMinPrice) {
      conditions.basePrice = { [Op.gte]: Number(minPrice) };
    } else if (hasMaxPrice) {
      conditions.basePrice = { [Op.lte]: Number(maxPrice) };
    }

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
      conditions.brandId = brandData.length > 0 ? { [Op.in]: brandData.map(b => b.id) } : -1;
    }

    if (categoryId && categoryId !== "") {
      const categoryIds = Array.isArray(categoryId)
        ? categoryId
        : String(categoryId).split(",").map(id => Number(id.trim()));
      conditions.categoryId = { [Op.in]: categoryIds };
    } else if (category && category !== "") {
      const categorySlugs = Array.isArray(category)
        ? category
        : String(category).split(",").map(s => s.trim());
      const categoryData = await db.Category.findAll({ where: { slug: { [Op.in]: categorySlugs } } });
      conditions.categoryId = categoryData.length > 0 ? { [Op.in]: categoryData.map(c => c.id) } : -1;
    }

    if (search && search !== "") {
      const searchTrim = search.trim();

      const matchedBrands = await db.Brand.findAll({
        where: { name: { [Op.like]: `%${searchTrim}%` } },
        attributes: ["id"],
        raw: true,
      });
      const matchedBrandIds = matchedBrands.map((b) => b.id);

      const matchedCategories = await db.Category.findAll({
        where: { name: { [Op.like]: `%${searchTrim}%` } },
        attributes: ["id"],
        raw: true,
      });
      const matchedCategoryIds = matchedCategories.map((c) => c.id);

      const searchOrConditions = [
        { name: { [Op.like]: `%${searchTrim}%` } },
        { sku: { [Op.like]: `%${searchTrim}%` } },
        { description: { [Op.like]: `%${searchTrim}%` } },
      ];

      if (matchedBrandIds.length > 0) {
        searchOrConditions.push({ brandId: { [Op.in]: matchedBrandIds } });
      }
      if (matchedCategoryIds.length > 0) {
        searchOrConditions.push({ categoryId: { [Op.in]: matchedCategoryIds } });
      }

      conditions[Op.or] = searchOrConditions;
    }

    // Xử lý lọc thuộc tính (Attributes filtering) - Sử dụng Subquery để đảm bảo phép AND giữa các loại
    const filterParams = { ram, rom, screen, battery, os, refresh_rate };
    const andConditions = [];

    Object.keys(filterParams).forEach((key) => {
      const val = filterParams[key];
      if (val && val !== "") {
        const values = Array.isArray(val) ? val : String(val).split(",").map(v => v.trim());
        if (values.length > 0) {
          // Mỗi loại thuộc tính phải thỏa mãn ít nhất một trong các giá trị đã chọn (OR trong nhóm, AND giữa các nhóm)
          // Escape both attribute key and values using dialect-aware escaping (db.sequelize.escape)
          const safeKey = db.sequelize.escape(key);
          const safeValues = values.map((v) => db.sequelize.escape(String(v))).join(",");
          andConditions.push({
            id: {
              [Op.in]: db.sequelize.literal(`(
                SELECT pav.productId 
                FROM ProductAttributeValues AS pav
                JOIN AttributeValues AS av ON pav.attributeValueId = av.id
                JOIN Attributes AS a ON av.attributeId = a.id
                WHERE a.code = ${safeKey} AND av.value IN (${safeValues})
                UNION
                SELECT pv.productId
                FROM VariantAttributeValues AS vav
                JOIN ProductVariants AS pv ON vav.variantId = pv.id
                JOIN AttributeValues AS av2 ON vav.attributeValueId = av2.id
                JOIN Attributes AS a2 ON av2.attributeId = a2.id
                WHERE a2.code = ${safeKey} AND av2.value IN (${safeValues})
              )`),
            },
          });
        }
      }
    });

    if (andConditions.length > 0) {
      conditions[Op.and] = [...(conditions[Op.and] || []), ...andConditions];
    }

    const attributes = [
      "id", "name", "slug", "sku", "basePrice", "discount", "totalStock", "sold",
      "hasVariants", "isFlashSale", "flashSaleStart", "flashSaleEnd", "flashSalePrice",
      "isActive", "categoryId", "brandId", "createdAt",
      [
        db.sequelize.literal(`(
          SELECT COALESCE(ROUND(AVG(rating), 1), 5.0)
          FROM Reviews AS r
          WHERE r.productId = Product.id
        )`),
        "avgRating",
      ],
      [
        db.sequelize.literal(`(
          SELECT COUNT(*)
          FROM Reviews AS r
          WHERE r.productId = Product.id
        )`),
        "reviewCount",
      ],
    ];

    const include = [
      { model: db.Brand, as: "brand", attributes: ["id", "name", "slug"] },
      { model: db.Category, as: "category", attributes: ["id", "name", "slug"] },
      {
        model: db.ProductImage,
        as: "images",
        attributes: ["imageUrl", "isPrimary"],
      },
      {
        model: db.ProductVariant,
        as: "variants",
        attributes: ["id", "productId", "sku", "price", ["price", "basePrice"], "discount", "salePrice", "stock"],
        include: [
          {
            model: db.AttributeValue,
            as: "attributes",
            include: [{ model: db.Attribute, as: "attribute", attributes: ["id", "name", "code"] }],
          },
        ],
        required: false,
      },
    ];

    let order = [];
    if (sort === "price_asc" || sort === "price-asc") {
      order = [["basePrice", "ASC"]];
    } else if (sort === "price_desc" || sort === "price-desc") {
      order = [["basePrice", "DESC"]];
    } else if (sort === "best-seller" || sort === "bestseller" || sort === "best_seller") {
      order = [["sold", "DESC"], ["id", "DESC"]];
    } else if (sort === "rating") {
      order = [[db.sequelize.literal("avgRating"), "DESC"], [db.sequelize.literal("reviewCount"), "DESC"], ["id", "DESC"]];
    } else if (sort === "discount") {
      order = [["discount", "DESC"], ["id", "DESC"]];
    } else if (sort === "newest") {
      order = [["createdAt", "DESC"]];
    }
    if (!order.length) order = [["id", "DESC"]];

    const { offset, limit: l } = getPagination(page, limit);
    const data = await db.Product.findAndCountAll({
      where: conditions,
      attributes,
      include,
      order,
      limit: l,
      offset,
      distinct: true,
    });

    const pagingData = getPagingData(data, page, l);
    const { items, ...paginationMetadata } = pagingData;

    const mappedProducts = items.map((p) => {
      const pJSON = p.toJSON();
      const primary =
        pJSON.images?.find((i) => i.isPrimary) || pJSON.images?.[0];
      return {
        ...applyFlashSaleToProduct(pJSON),
        image: primary?.imageUrl || null,
      };
    });

    return {
      errCode: 0,
      data: mappedProducts,
      products: mappedProducts,
      pagination: paginationMetadata,
    };
  } catch (error) {
    console.error(error);
    return { errCode: 1, errMessage: error.message };
  }
};

const getHomePageData = async () => {
  try {
    const { getCache, setCache } = require("../../config/redis");
    const BrandService = require("../catalog/BrandService");
    const CategoryService = require("../catalog/CategoryService");
    const productCore = require("./productCore");

    const cacheKey = "home_page_aggregated_data_v1";
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const [brandsRes, categoriesRes, flashSaleRes, productsRes] = await Promise.all([
      BrandService.getAllBrands(1, 20),
      CategoryService.getAllCategories(1, 20),
      productCore.getAllProducts(null, 1, 10, true),
      productCore.getAllProducts(null, 1, 12, false),
    ]);

    const result = {
      errCode: 0,
      data: {
        brands: brandsRes.brands || brandsRes.data || [],
        categories: categoriesRes.data || [],
        flashSale: flashSaleRes.products || [],
        products: productsRes.products || [],
      },
    };

    await setCache(cacheKey, result, 300);
    return result;
  } catch (error) {
    console.error("Error in getHomePageData:", error);
    return { errCode: 1, errMessage: error.message };
  }
};

const searchSemanticProducts = async (query, limit = 5, filters = {}) => {
  try {
    return await HybridSearchService.search(query, {
      limit,
      ...filters,
    });
  } catch (e) {
    console.error("Lỗi tìm kiếm ngữ nghĩa:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const syncAllProductEmbeddings = async (options = {}) => {
  return await EmbeddingSyncService.syncAllProducts(options);
};

module.exports = {
  searchProducts,
  searchSuggestions,
  filterProducts,
  getHomePageData,
  searchSemanticProducts,
  syncAllProductEmbeddings,
};
