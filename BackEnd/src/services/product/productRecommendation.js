const db = require("../../models");
const { Op } = require("sequelize");
const {
  getPagination,
  getPagingData,
} = require("../../utils/paginationHelper");
const {
  getFengShuiDetail,
  buildLuckyColorWhereClauses,
  matchesLuckyColor,
} = require("../../utils/fortuneUtils");
const { cosineSimilarity } = require("../../utils/embeddingHelper");
const { applyFlashSaleToProduct } = require("./productHelper");

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
      attributes: { exclude: ["embedding"] },
      include: [
        { model: db.Brand, as: "brand" },
        { model: db.Category, as: "category" },
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
      order: [
        ["sold", "DESC"],
        ["createdAt", "DESC"],
      ],
      offset,
      limit: l,
      distinct: true,
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

const recommendFortuneProducts = async ({
  birthYear,
  gender = "male",
  brandId,
  minPrice,
  maxPrice,
  categoryId,
  sortBy = "popular",
  page = 1,
  limit = 6,
}) => {
  try {
    const safeYear = Number(birthYear) || 1998;
    const fsDetail = getFengShuiDetail(safeYear, gender);
    const luckyColors = [
      ...(fsDetail.luckyColors || []),
      ...(fsDetail.supportColors || []),
    ];
    const baseWhere = { isActive: true };
    if (brandId) baseWhere.brandId = brandId;
    if (categoryId) baseWhere.categoryId = categoryId;
    if (minPrice != null) {
      baseWhere.basePrice = { ...baseWhere.basePrice, [Op.gte]: minPrice };
    }
    if (maxPrice != null) {
      baseWhere.basePrice = { ...baseWhere.basePrice, [Op.lte]: maxPrice };
    }

    const colorClauses = buildLuckyColorWhereClauses(db, luckyColors);
    const where =
      colorClauses.length > 0
        ? { ...baseWhere, [Op.or]: colorClauses }
        : { ...baseWhere };

    let order = [
      ["sold", "DESC"],
      ["createdAt", "DESC"],
    ];
    if (sortBy === "price_asc") {
      order = [
        ["basePrice", "ASC"],
        ["createdAt", "DESC"],
      ];
    } else if (sortBy === "price_desc") {
      order = [
        ["basePrice", "DESC"],
        ["createdAt", "DESC"],
      ];
    } else if (sortBy === "newest") {
      order = [["createdAt", "DESC"]];
    } else if (sortBy === "discount") {
      order = [
        ["discount", "DESC"],
        ["sold", "DESC"],
      ];
    }

    const { offset, limit: l } = getPagination(page, limit);
    const queryOptions = {
      where,
      attributes: { exclude: ["embedding"] },
      include: [
        { model: db.Brand, as: "brand" },
        { model: db.Category, as: "category" },
        {
          model: db.ProductImage,
          as: "images",
          attributes: ["imageUrl", "isPrimary"],
        },
        {
          model: db.AttributeValue,
          as: "attributes",
          attributes: ["id", "value"],
          include: [
            {
              model: db.Attribute,
              as: "attribute",
              attributes: ["code", "name"],
              required: false,
            },
          ],
          required: false,
        },
        {
          model: db.ProductVariant,
          as: "variants",
          attributes: [
            "id",
            "price",
            "discount",
            "stock",
            "sku",
            "attributeValues",
            "isActive",
          ],
          where: { isActive: true },
          required: false,
        },
        {
          model: db.Review,
          as: "reviews",
          attributes: ["id", "rating"],
          required: false,
        },
      ],
      order,
      offset,
      limit: l,
      distinct: true,
    };

    let result = await db.Product.findAndCountAll(queryOptions);
    let isFallback = false;

    if ((result?.count || 0) === 0 && luckyColors.length > 0) {
      result = await db.Product.findAndCountAll({
        ...queryOptions,
        where: baseWhere,
      });
      isFallback = true;
    }

    const { count, rows } = result;
    const pagingData = getPagingData({ count, rows }, page, l);
    const { items, ...paginationMetadata } = pagingData;

    return {
      errCode: 0,
      data: items.map((p) => {
        const pJSON = typeof p.toJSON === "function" ? p.toJSON() : { ...p };
        const primary =
          pJSON.images?.find((i) => i.isPrimary) || pJSON.images?.[0];
        const product = applyFlashSaleToProduct({
          ...pJSON,
          image: primary?.imageUrl || null,
        });
        product.isLuckyColor = matchesLuckyColor(product, luckyColors);
        return product;
      }),
      luckyColors,
      isFallback,
      pagination: paginationMetadata,
    };
  } catch (e) {
    console.error("Error in recommendFortuneProducts:", e);
    return { errCode: -1, errMessage: e.message };
  }
};

const getSmartRecommendations = async (productId, limit = 6) => {
  try {
    const { getCache, setCache } = require("../../config/redis");
    const VectorIndexService = require("../ai/VectorIndexService");
    const cacheKey = `smart_recs_${productId}_${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const product = await db.Product.findByPk(productId);
    if (!product) return { errCode: 1, errMessage: "Sản phẩm không tồn tại" };

    let semanticMatches = [];
    const vectorHits = VectorIndexService.getSimilarByProductId(Number(productId), {
      limit,
      minScore: 0.45,
    });

    if (vectorHits.length > 0) {
      const hitIds = vectorHits.map((h) => h.productId);
      const scoreMap = new Map(vectorHits.map((h) => [Number(h.productId), h.score]));
      const similarRows = await db.Product.findAll({
        where: { id: { [Op.in]: hitIds }, isActive: true },
        attributes: [
          "id",
          "name",
          "slug",
          "basePrice",
          "discount",
          "isFlashSale",
          "flashSalePrice",
          "flashSaleStart",
          "flashSaleEnd",
        ],
        include: [
          {
            model: db.ProductImage,
            as: "images",
            attributes: ["imageUrl", "isPrimary"],
          },
        ],
      });

      const byId = new Map();
      for (const row of similarRows) {
        const plain = typeof row.get === "function" ? row.get({ plain: true }) : { ...row };
        const primary = plain.images?.find((img) => img.isPrimary) || plain.images?.[0];
        byId.set(Number(plain.id), {
          ...plain,
          image: primary?.imageUrl || null,
          similarity: scoreMap.get(Number(plain.id)) || 0,
          reason: "Tương đồng ngữ nghĩa AI",
        });
      }
      semanticMatches = hitIds.map((hid) => byId.get(Number(hid))).filter(Boolean);
    } else if (product.embedding) {
      let queryEmbedding = null;
      try {
        queryEmbedding =
          typeof product.embedding === "string"
            ? JSON.parse(product.embedding)
            : product.embedding;
      } catch (e) {
        queryEmbedding = null;
      }

      if (queryEmbedding && Array.isArray(queryEmbedding)) {
        const allProducts = await db.Product.findAll({
          where: {
            isActive: true,
            id: { [Op.ne]: productId },
            embedding: { [Op.ne]: null },
          },
          attributes: [
            "id",
            "name",
            "slug",
            "basePrice",
            "discount",
            "embedding",
          ],
          limit: 150,
          order: [["sold", "DESC"]],
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
            try {
              const plain = p.get({ plain: true });
              const primary =
                plain.images?.find((img) => img.isPrimary) || plain.images?.[0];
              const pEmbedding =
                typeof plain.embedding === "string"
                  ? JSON.parse(plain.embedding)
                  : plain.embedding;
              if (!Array.isArray(pEmbedding)) return null;
              return {
                id: plain.id,
                name: plain.name,
                slug: plain.slug,
                basePrice: plain.basePrice,
                discount: plain.discount,
                image: primary?.imageUrl || null,
                similarity: cosineSimilarity(queryEmbedding, pEmbedding),
                reason: "Cùng phong cách",
              };
            } catch {
              return null;
            }
          })
          .filter((p) => p && p.similarity > 0.7)
          .sort((a, b) => b.similarity - a.similarity);
      }
    }

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
          where: { id: { [Op.in]: productIds }, isActive: true },
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
          const primary =
            plain.images?.find((img) => img.isPrimary) || plain.images?.[0];
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
            return productInfo
              ? { ...productInfo, reason: "Thường mua cùng" }
              : null;
          })
          .filter(Boolean);
      }
    }

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

    if (uniqueResults.length < limit) {
      const idConditions = [{ [Op.ne]: productId }];
      if (seenIds.size > 0) {
        idConditions.push({ [Op.notIn]: Array.from(seenIds) });
      }
      const fallback = await db.Product.findAll({
        where: {
          categoryId: product.categoryId,
          id: {
            [Op.and]: idConditions,
          },
          isActive: true,
        },
        limit: limit - uniqueResults.length,
        attributes: [
          "id",
          "name",
          "slug",
          "basePrice",
          "discount",
          "isFlashSale",
          "flashSalePrice",
          "flashSaleStart",
          "flashSaleEnd",
        ],
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
        const primary =
          plain.images?.find((img) => img.isPrimary) || plain.images?.[0];
        uniqueResults.push({
          ...applyFlashSaleToProduct({
            ...plain,
            image: primary?.imageUrl || null,
          }),
          reason: "Cùng danh mục",
        });
      });
    }

    const result = { errCode: 0, products: uniqueResults };
    await setCache(cacheKey, result, 7200); // Cache for 2 hours
    return result;
  } catch (e) {
    console.error("Lỗi getSmartRecommendations:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

const getPersonalizedRecommendations = async (userId, limit = 6) => {
  try {
    const { getCache, setCache } = require("../../config/redis");
    const cacheKey = `user_recs_${userId || "guest"}_${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    if (!userId) {
      // Fallback for non-logged in users: trending products
      const trending = await db.Product.findAll({
        where: { isActive: true },
        attributes: [
          "id",
          "name",
          "slug",
          "sku",
          "basePrice",
          "discount",
          "totalStock",
          "hasVariants",
          "sold",
          "isFlashSale",
          "flashSalePrice",
          "flashSaleStart",
          "flashSaleEnd",
          "isActive",
          "categoryId",
          "brandId",
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
        ],
        order: [["sold", "DESC"]],
        limit,
        include: [
          {
            model: db.ProductImage,
            as: "images",
            where: { isPrimary: true },
            required: false,
          },
        ],
      });
      const result = {
        errCode: 0,
        products: trending.map((p) => {
          const plain = p.get({ plain: true });
          return {
            ...applyFlashSaleToProduct(plain),
            image: plain.images?.[0]?.imageUrl || null,
            reason: "Xu hướng",
          };
        }),
      };
      await setCache(cacheKey, result, 3600); // 1 hour for guests
      return result;
    }

    // 1. Get user's interaction history (Orders and Wishlist)
    const [orders, wishlist] = await Promise.all([
      db.Order.findAll({
        where: { userId },
        include: [
          {
            model: db.OrderItem,
            as: "orderItems",
            include: [{ model: db.Product, as: "product" }],
          },
        ],
      }),
      db.Wishlist.findAll({
        where: { userId },
        include: [{ model: db.Product, as: "product" }],
      }),
    ]);

    const historyProducts = [];
    orders.forEach((o) =>
      o.orderItems.forEach((item) => {
        if (item.product) historyProducts.push(item.product);
      }),
    );
    wishlist.forEach((w) => {
      if (w.product) historyProducts.push(w.product);
    });

    if (historyProducts.length === 0) {
      // Fallback if no history
      return getPersonalizedRecommendations(null, limit);
    }

    // 2. Average the embeddings of history products to find "User Taste"
    const validEmbeddings = historyProducts
      .filter((p) => p.embedding)
      .map((p) => {
        try {
          return typeof p.embedding === "string"
            ? JSON.parse(p.embedding)
            : p.embedding;
        } catch {
          return null;
        }
      })
      .filter((e) => Array.isArray(e));

    if (validEmbeddings.length === 0) {
      return getPersonalizedRecommendations(null, limit);
    }

    const userTasteVector = validEmbeddings[0].map(
      (_, i) =>
        validEmbeddings.reduce((acc, curr) => acc + curr[i], 0) /
        validEmbeddings.length,
    );

    // 3. Find semantically similar products
    const allProducts = await db.Product.findAll({
      where: {
        isActive: true,
        id: { [Op.notIn]: historyProducts.map((p) => p.id) }, // Don't recommend what they already have/wishlisted
        embedding: { [Op.ne]: null },
      },
      limit: 150,
      order: [["sold", "DESC"]],
      attributes: [
        "id",
        "name",
        "slug",
        "sku",
        "basePrice",
        "discount",
        "totalStock",
        "hasVariants",
        "sold",
        "isFlashSale",
        "flashSalePrice",
        "flashSaleStart",
        "flashSaleEnd",
        "isActive",
        "categoryId",
        "brandId",
        "embedding",
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
      ],
      include: [
        {
          model: db.ProductImage,
          as: "images",
          where: { isPrimary: true },
          required: false,
        },
      ],
    });

    const recommendations = allProducts
      .map((p) => {
        try {
          const plain = p.get({ plain: true });
          const pEmbedding =
            typeof plain.embedding === "string"
              ? JSON.parse(plain.embedding)
              : plain.embedding;
          if (!Array.isArray(pEmbedding)) return null;
          const similarity = cosineSimilarity(userTasteVector, pEmbedding);
          const { embedding: _emb, ...cleanPlain } = plain;
          return {
            ...applyFlashSaleToProduct(cleanPlain),
            image: plain.images?.[0]?.imageUrl || null,
            similarity,
            reason: "Dựa trên sở thích của bạn",
          };
        } catch {
          return null;
        }
      })
      .filter((p) => p && p.similarity > 0.6)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    const result = { errCode: 0, products: recommendations };
    await setCache(cacheKey, result, 900); // 15 minutes for logged in users
    return result;
  } catch (e) {
    console.error("Lỗi getPersonalizedRecommendations:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

module.exports = {
  recommendProducts,
  recommendFortuneProducts,
  getSmartRecommendations,
  getPersonalizedRecommendations,
};
