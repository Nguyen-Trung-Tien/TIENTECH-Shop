const db = require("../../models");
const { Op } = require("sequelize");
const { getPagination, getPagingData } = require("../../utils/paginationHelper");
const { getLuckyColorsByYear } = require("../../utils/fortuneUtils");
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

const getSmartRecommendations = async (productId, limit = 6) => {
  try {
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

    return { errCode: 0, products: uniqueResults };
  } catch (e) {
    console.error("Lỗi getSmartRecommendations:", e);
    return { errCode: 1, errMessage: e.message };
  }
};

module.exports = {
  recommendProducts,
  recommendFortuneProducts,
  getSmartRecommendations,
};
