const db = require("../../models");
const { Op } = require("sequelize");
const { getPagination, getPagingData } = require("../../utils/paginationHelper");
const { getFengShuiDetail } = require("../../utils/fortuneUtils");
const { cosineSimilarity } = require("../../utils/embeddingHelper");

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
  brandId,
  minPrice,
  maxPrice,
  categoryId,
  page = 1,
  limit = 6,
}) => {
  try {
    const fsDetail = getFengShuiDetail(Number(birthYear));
    const luckyColors = [...(fsDetail.luckyColors || []), ...(fsDetail.supportColors || [])];
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
        const specsStr = typeof product.specifications === "string"
          ? product.specifications
          : JSON.stringify(product.specifications || {});
        const nameAndDesc = `${product.name} ${product.description || ""} ${specsStr}`.toLowerCase();
        product.isLuckyColor = luckyColors.some((color) => nameAndDesc.includes(color.toLowerCase()));
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

const getSmartRecommendations = async (productId, limit = 6) => {
  try {
    const { getCache, setCache } = require("../../config/redis");
    const cacheKey = `smart_recs_${productId}_${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const product = await db.Product.findByPk(productId);
    if (!product) return { errCode: 1, errMessage: "Sản phẩm không tồn tại" };

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
        order: [["sold", "DESC"]],
        limit,
        include: [{ model: db.ProductImage, as: "images", where: { isPrimary: true }, required: false }],
      });
      const result = {
        errCode: 0,
        products: trending.map(p => {
          const plain = p.get({ plain: true });
          return { ...plain, image: plain.images?.[0]?.imageUrl || null, reason: "Xu hướng" };
        })
      };
      await setCache(cacheKey, result, 3600); // 1 hour for guests
      return result;
    }

    // 1. Get user's interaction history (Orders and Wishlist)
    const [orders, wishlist] = await Promise.all([
      db.Order.findAll({
        where: { userId },
        include: [{ model: db.OrderItem, as: "orderItems", include: [{ model: db.Product, as: "product" }] }],
      }),
      db.Wishlist.findAll({
        where: { userId },
        include: [{ model: db.Product, as: "product" }],
      }),
    ]);

    const historyProducts = [];
    orders.forEach(o => o.orderItems.forEach(item => { if (item.product) historyProducts.push(item.product); }));
    wishlist.forEach(w => { if (w.product) historyProducts.push(w.product); });

    if (historyProducts.length === 0) {
      // Fallback if no history
      return getPersonalizedRecommendations(null, limit);
    }

    // 2. Average the embeddings of history products to find "User Taste"
    const validEmbeddings = historyProducts
      .filter(p => p.embedding)
      .map(p => JSON.parse(p.embedding));

    if (validEmbeddings.length === 0) {
      return getPersonalizedRecommendations(null, limit);
    }

    const userTasteVector = validEmbeddings[0].map((_, i) => 
      validEmbeddings.reduce((acc, curr) => acc + curr[i], 0) / validEmbeddings.length
    );

    // 3. Find semantically similar products
    const allProducts = await db.Product.findAll({
      where: {
        isActive: true,
        id: { [Op.notIn]: historyProducts.map(p => p.id) }, // Don't recommend what they already have/wishlisted
        embedding: { [Op.ne]: null },
      },
      attributes: ["id", "name", "slug", "basePrice", "discount", "embedding"],
      include: [{ model: db.ProductImage, as: "images", where: { isPrimary: true }, required: false }],
    });

    const recommendations = allProducts
      .map(p => {
        const plain = p.get({ plain: true });
        const similarity = cosineSimilarity(userTasteVector, JSON.parse(plain.embedding));
        return {
          ...plain,
          image: plain.images?.[0]?.imageUrl || null,
          similarity,
          reason: "Dựa trên sở thích của bạn"
        };
      })
      .filter(p => p.similarity > 0.6)
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
