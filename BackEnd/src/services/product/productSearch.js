const db = require("../../models");
const { Op } = require("sequelize");
const { getPagination, getPagingData } = require("../../utils/paginationHelper");
const {
  generateEmbedding,
  cosineSimilarity,
} = require("../../utils/embeddingHelper");
const {
  applyFlashSaleToProduct,
  updateProductEmbedding,
} = require("./productHelper");

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
    if (!isAdmin) {
      conditions.isActive = true;
    }

    if (isFlashSale === true || isFlashSale === "true") {
      const now = new Date();
      conditions.isFlashSale = true;
      conditions.flashSaleStart = { [Op.lte]: now };
      conditions.flashSaleEnd = { [Op.gte]: now };
    }

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
      if (categoryData.length > 0) conditions.categoryId = { [Op.in]: categoryData.map(c => c.id) };
    }

    if (search && search !== "") conditions.name = { [Op.like]: `%${search}%` };

    const include = [
      { model: db.Brand, as: "brand" },
      { model: db.Category, as: "category" },
      {
        model: db.ProductImage,
        as: "images",
        attributes: ["imageUrl", "isPrimary"],
      },
    ];

    // Xử lý lọc thuộc tính (Attributes filtering)
    const filterParams = { ram, rom, screen, battery, os, refresh_rate };
    const selectedAttrValues = [];
    let attributeTypeCount = 0;

    Object.keys(filterParams).forEach((key) => {
      const val = filterParams[key];
      if (val && val !== "") {
        const values = Array.isArray(val) ? val : String(val).split(",").map(v => v.trim());
        if (values.length > 0) {
          selectedAttrValues.push(...values);
          attributeTypeCount++; // Đếm số loại thuộc tính khác nhau được chọn
        }
      }
    });

    if (selectedAttrValues.length > 0) {
      include.push({
        model: db.AttributeValue,
        as: "attributes",
        where: { value: { [Op.in]: selectedAttrValues } },
        through: { attributes: [] },
        required: true
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

const searchSemanticProducts = async (query, limit = 5) => {
  try {
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding)
      return {
        errCode: 1,
        errMessage: "Không thể tạo embedding cho truy vấn.",
      };

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
      .filter((p) => p.similarity > 0.3)
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

module.exports = {
  searchProducts,
  searchSuggestions,
  filterProducts,
  searchSemanticProducts,
  syncAllProductEmbeddings,
};
