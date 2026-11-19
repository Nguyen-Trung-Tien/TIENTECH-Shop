const { Op, QueryTypes } = require("sequelize");
const db = require("../../models");
const VectorIndexService = require("./VectorIndexService");
const { generateMultimodalEmbedding } = require("../../utils/embeddingHelper");
const { applyFlashSaleToProduct } = require("../product/productHelper");

const RRF_K = 60;

const search = async (
  query,
  {
    limit = 10,
    minPrice,
    maxPrice,
    categoryId,
    brandId,
    imageBase64 = null,
    mimeType = "image/jpeg",
    mode = "hybrid",
  } = {},
) => {
  const safeLimit = Math.max(1, Math.min(50, Number(limit) || 10));
  const candidateLimit = Math.max(safeLimit * 3, 20);
  const cleanQuery = typeof query === "string" ? query.trim() : "";

  if (!cleanQuery && !imageBase64) {
    return {
      errCode: 0,
      errMessage: "OK",
      products: [],
      data: [],
      meta: { strategy: "empty", vectorHits: 0, lexicalHits: 0 },
    };
  }

  let vectorHits = [];
  let lexicalProducts = [];

  // 1. Semantic / Multimodal Vector Branch
  if (mode !== "lexical" && VectorIndexService.count > 0 && (cleanQuery || imageBase64)) {
    try {
      const embResult = await generateMultimodalEmbedding({
        text: cleanQuery,
        imageBase64,
        mimeType,
        taskType: "RETRIEVAL_QUERY",
      });
      if (embResult?.vector) {
        vectorHits = VectorIndexService.searchByVector(embResult.vector, {
          limit: candidateLimit,
          minScore: 0.25,
          categoryId,
          brandId,
          minPrice,
          maxPrice,
        });
      }
    } catch (vecErr) {
      console.warn("[HybridSearchService] Vector branch warning:", vecErr?.message);
    }
  }

  // 2. Lexical + SQL FULLTEXT Branch
  if (mode !== "vector" && cleanQuery) {
    try {
      const ProductService = require("../product/ProductService");
      const lexRes = await ProductService.filterProducts({
        search: cleanQuery,
        minPrice,
        maxPrice,
        categoryId,
        brandId,
        page: 1,
        limit: candidateLimit,
      });

      lexicalProducts = Array.isArray(lexRes?.data)
        ? lexRes.data
        : Array.isArray(lexRes?.products)
          ? lexRes.products
          : [];

      // Optional MySQL FULLTEXT supplement in production/dev when LIKE hits are sparse
      if (
        process.env.NODE_ENV !== "test" &&
        lexicalProducts.length < safeLimit &&
        db.sequelize &&
        typeof db.sequelize.query === "function"
      ) {
        try {
          const ftRows = await db.sequelize.query(
            "SELECT id FROM Products WHERE isActive = 1 AND MATCH(name, description) AGAINST (:q IN NATURAL LANGUAGE MODE) LIMIT :ftLimit",
            {
              replacements: { q: cleanQuery, ftLimit: candidateLimit },
              type: QueryTypes.SELECT,
            },
          );
          const existingIds = new Set(lexicalProducts.map((p) => Number(p.id)));
          const extraIds = ftRows
            .map((r) => Number(r.id))
            .filter((id) => Number.isInteger(id) && !existingIds.has(id));
          if (extraIds.length > 0) {
            const extraProducts = await db.Product.findAll({
              where: {
                id: { [Op.in]: extraIds },
                isActive: true,
                ...(categoryId ? { categoryId } : {}),
                ...(brandId ? { brandId } : {}),
                ...(minPrice != null ? { basePrice: { [Op.gte]: Number(minPrice) } } : {}),
                ...(maxPrice != null ? { basePrice: { [Op.lte]: Number(maxPrice) } } : {}),
              },
              attributes: { exclude: ["embedding"] },
              include: [
                { model: db.Category, as: "category" },
                { model: db.Brand, as: "brand" },
                {
                  model: db.ProductImage,
                  as: "images",
                  attributes: ["imageUrl", "isPrimary"],
                  required: false,
                },
                {
                  model: db.Review,
                  as: "reviews",
                  attributes: ["id", "rating"],
                  required: false,
                },
              ],
            });
            for (const p of extraProducts) {
              const plain = typeof p.toJSON === "function" ? p.toJSON() : { ...p };
              const primary = plain.images?.find((i) => i.isPrimary) || plain.images?.[0];
              lexicalProducts.push({
                ...applyFlashSaleToProduct(plain),
                image: primary?.imageUrl || null,
              });
            }
          }
        } catch {
          // Graceful no-op if FULLTEXT index is unavailable
        }
      }
    } catch (lexErr) {
      console.warn("[HybridSearchService] Lexical branch warning:", lexErr?.message);
    }
  }

  const usedVector = vectorHits.length > 0;
  const usedLexical = lexicalProducts.length > 0;
  const hasBoth = usedVector && usedLexical;

  // 3. Reciprocal Rank Fusion (RRF)
  const fusedMap = new Map();

  vectorHits.forEach((hit, idx) => {
    const pid = Number(hit.productId);
    const weight = hasBoth ? 0.65 : 1.0;
    const score = weight / (RRF_K + (idx + 1));
    fusedMap.set(pid, {
      productId: pid,
      rrfScore: score,
      similarity: hit.score,
      isSemanticMatch: true,
      product: null,
    });
  });

  lexicalProducts.forEach((prod, idx) => {
    const pid = Number(prod.id);
    const weight = hasBoth ? 0.35 : 1.0;
    const score = weight / (RRF_K + (idx + 1));
    const current = fusedMap.get(pid);
    if (current) {
      current.rrfScore += score;
      current.product = prod;
    } else {
      fusedMap.set(pid, {
        productId: pid,
        rrfScore: score,
        similarity: null,
        isSemanticMatch: false,
        product: prod,
      });
    }
  });

  const rankedEntries = Array.from(fusedMap.values())
    .sort((a, b) => b.rrfScore - a.rrfScore)
    .slice(0, safeLimit);

  // Hydrate products that originated solely from vector search
  const missingIds = rankedEntries
    .filter((entry) => !entry.product)
    .map((entry) => entry.productId);

  const hydratedMap = new Map();
  if (missingIds.length > 0 && db.Product) {
    try {
      const rows = await db.Product.findAll({
        where: { id: { [Op.in]: missingIds }, isActive: true },
        attributes: { exclude: ["embedding"] },
        include: [
          { model: db.Category, as: "category" },
          { model: db.Brand, as: "brand" },
          {
            model: db.ProductImage,
            as: "images",
            attributes: ["imageUrl", "isPrimary"],
            required: false,
          },
          {
            model: db.Review,
            as: "reviews",
            attributes: ["id", "rating"],
            required: false,
          },
        ],
      });
      for (const row of rows) {
        const plain = typeof row.toJSON === "function" ? row.toJSON() : { ...row };
        const primary = plain.images?.find((i) => i.isPrimary) || plain.images?.[0];
        hydratedMap.set(Number(plain.id), {
          ...applyFlashSaleToProduct(plain),
          image: primary?.imageUrl || null,
        });
      }
    } catch (hydrateErr) {
      console.warn("[HybridSearchService] Hydrate warning:", hydrateErr?.message);
    }
  }

  const finalProducts = rankedEntries
    .map((entry) => {
      const baseProd = entry.product || hydratedMap.get(entry.productId);
      if (!baseProd) return null;
      return {
        ...baseProd,
        ...(entry.similarity != null ? { similarity: entry.similarity } : {}),
        isSemanticMatch: entry.isSemanticMatch,
      };
    })
    .filter(Boolean);

  const strategy = hasBoth
    ? "hybrid_rrf"
    : usedVector
      ? "vector"
      : "lexical_fallback";

  return {
    errCode: 0,
    errMessage: "OK",
    products: finalProducts,
    data: finalProducts,
    meta: {
      strategy,
      vectorHits: vectorHits.length,
      lexicalHits: lexicalProducts.length,
    },
  };
};

module.exports = {
  search,
  RRF_K,
};
