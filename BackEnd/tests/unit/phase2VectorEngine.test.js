const db = require("../../src/models");
const geminiConfig = require("../../src/config/gemini");
const redisConfig = require("../../src/config/redis");
const ProductService = require("../../src/services/product/ProductService");
const VectorIndexService = require("../../src/services/ai/VectorIndexService");
const EmbeddingSyncService = require("../../src/services/ai/EmbeddingSyncService");
const HybridSearchService = require("../../src/services/ai/HybridSearchService");
const VisionAIService = require("../../src/services/ai/VisionAIService");
const {
  EMBEDDING_DIMENSIONS,
  normalizeVector,
  float32ToBuffer,
  bufferToFloat32,
  dotProductNormalized,
  computeProductContentHash,
  generateMultimodalEmbedding,
} = require("../../src/utils/embeddingHelper");

const makeBasisVector = (hotIndex, secondaryIndex = null, secondaryWeight = 0) => {
  const arr = new Array(EMBEDDING_DIMENSIONS).fill(0);
  arr[hotIndex] = 1;
  if (secondaryIndex !== null) {
    arr[secondaryIndex] = secondaryWeight;
  }
  return normalizeVector(arr);
};

describe("Phase 2: AI Vector Engine Unit Tests", () => {
  beforeEach(() => {
    VectorIndexService.clear();
    jest.spyOn(redisConfig, "getCache").mockResolvedValue(null);
    jest.spyOn(redisConfig, "setCache").mockResolvedValue(true);
    jest.spyOn(redisConfig, "deleteCacheByPattern").mockResolvedValue();
  });

  afterEach(() => {
    VectorIndexService.clear();
    jest.restoreAllMocks();
  });

  describe("embeddingHelper", () => {
    test("normalizeVector, Float32 Buffer round-trip & dotProductNormalized work accurately", () => {
      const raw = new Array(EMBEDDING_DIMENSIONS).fill(0);
      raw[0] = 3;
      raw[1] = 4;

      const norm = normalizeVector(raw);
      expect(norm).toBeInstanceOf(Float32Array);
      expect(norm[0]).toBeCloseTo(0.6, 5);
      expect(norm[1]).toBeCloseTo(0.8, 5);

      const buf = float32ToBuffer(norm);
      expect(Buffer.isBuffer(buf)).toBe(true);
      expect(buf.byteLength).toBe(EMBEDDING_DIMENSIONS * 4);

      const decoded = bufferToFloat32(buf, EMBEDDING_DIMENSIONS);
      expect(decoded).toBeInstanceOf(Float32Array);
      expect(decoded[0]).toBeCloseTo(norm[0], 5);
      expect(decoded[1]).toBeCloseTo(norm[1], 5);
      expect(bufferToFloat32(Buffer.from([1, 2, 3]), EMBEDDING_DIMENSIONS)).toBeNull();

      const ortho = makeBasisVector(5);
      expect(dotProductNormalized(norm, norm)).toBeCloseTo(1, 5);
      expect(dotProductNormalized(norm, ortho)).toBeCloseTo(0, 5);
    });

    test("computeProductContentHash changes when product text or primary image changes", () => {
      const p = { id: 1, name: "MacBook Pro 14", specifications: { ram: "16GB" } };
      const h1 = computeProductContentHash(p, "https://cdn.test/a.jpg");
      const h2 = computeProductContentHash(p, "https://cdn.test/a.jpg");
      const h3 = computeProductContentHash(p, "https://cdn.test/b.jpg");

      expect(h1).toHaveLength(64);
      expect(h1).toBe(h2);
      expect(h3).not.toBe(h1);
    });

    test("generateMultimodalEmbedding sends text+image parts to gemini-embedding-2 and falls back to gemini-embedding-001 on 404", async () => {
      const rawVec = new Array(EMBEDDING_DIMENSIONS).fill(0);
      rawVec[0] = 2;

      const embedSpy = jest
        .spyOn(geminiConfig.genAI.models, "embedContent")
        .mockResolvedValueOnce({ embeddings: [{ values: rawVec }] })
        .mockRejectedValueOnce(Object.assign(new Error("404 model not found"), { status: 404 }))
        .mockResolvedValueOnce({ embeddings: [{ values: rawVec }] });

      const multiRes = await generateMultimodalEmbedding({
        text: "Laptop OLED bạc",
        imageBase64: "data:image/png;base64,QUJDRA==",
        mimeType: "image/png",
        taskType: "RETRIEVAL_DOCUMENT",
      });

      expect(multiRes.model).toBe("gemini-embedding-2");
      expect(multiRes.vector[0]).toBeCloseTo(1, 5);
      expect(embedSpy.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          model: "gemini-embedding-2",
          contents: {
            parts: [
              { text: "Laptop OLED bạc" },
              { inlineData: { mimeType: "image/png", data: "QUJDRA==" } },
            ],
          },
          config: {
            taskType: "RETRIEVAL_DOCUMENT",
            outputDimensionality: EMBEDDING_DIMENSIONS,
          },
        }),
      );

      const fallbackRes = await generateMultimodalEmbedding({
        text: "Chuột gaming không dây",
        imageBase64: "QUJDRA==",
        taskType: "RETRIEVAL_QUERY",
      });

      expect(fallbackRes.model).toBe("gemini-embedding-001");
      expect(embedSpy.mock.calls[2][0].model).toBe("gemini-embedding-001");
      expect(embedSpy.mock.calls[2][0].contents).toBe("Chuột gaming không dây");
    });
  });

  describe("VectorIndexService In-Memory Float32Array Matrix", () => {
    test("upsertVector, searchByVector filters, getSimilarByProductId & swap-with-last removeVector work accurately", () => {
      VectorIndexService.upsertVector(10, makeBasisVector(0, 1, 0.2), {
        categoryId: 1,
        basePrice: 20000000,
      });
      VectorIndexService.upsertVector(20, makeBasisVector(1), {
        categoryId: 2,
        basePrice: 12000000,
      });
      VectorIndexService.upsertVector(30, makeBasisVector(0), {
        categoryId: 1,
        basePrice: 35000000,
      });

      expect(VectorIndexService.count).toBe(3);

      const hits = VectorIndexService.searchByVector(makeBasisVector(0), {
        limit: 5,
        minScore: 0.5,
      });
      expect(hits.map((h) => h.productId)).toEqual([30, 10]);

      const filtered = VectorIndexService.searchByVector(makeBasisVector(0), {
        categoryId: 1,
        maxPrice: 25000000,
        minScore: 0.5,
      });
      expect(filtered.map((h) => h.productId)).toEqual([10]);

      const similar = VectorIndexService.getSimilarByProductId(30, {
        limit: 5,
        minScore: 0.5,
      });
      expect(similar.map((h) => h.productId)).toEqual([10]);

      // Remove first slot (10) -> swaps last slot (30) into slot 0 cleanly
      expect(VectorIndexService.removeVector(10)).toBe(true);
      expect(VectorIndexService.count).toBe(2);
      const afterRemove = VectorIndexService.searchByVector(makeBasisVector(0), {
        minScore: 0.5,
      });
      expect(afterRemove.map((h) => h.productId)).toEqual([30]);
    });
  });

  describe("EmbeddingSyncService Incremental Sync & Failure Tracking", () => {
    test("syncProductEmbedding skips unchanged hash, stores ready Float32 BLOB in tx, and marks failed on API null", async () => {
      const sampleProd = {
        id: 77,
        name: "Keychron Q1 Pro",
        sku: "KC-Q1",
        isActive: true,
        categoryId: 3,
        brandId: 2,
        basePrice: 4500000,
        discount: 0,
        specifications: { layout: "75%" },
        images: [{ imageUrl: "/q1.png", isPrimary: true }],
        attributes: [],
        variants: [],
      };
      jest.spyOn(db.Product, "findByPk").mockResolvedValue({
        ...sampleProd,
        get: () => sampleProd,
      });

      const expectedHash = computeProductContentHash(sampleProd, "/q1.png");
      const vec = makeBasisVector(2);
      jest.spyOn(db.ProductEmbedding, "findOne").mockResolvedValueOnce({
        productId: 77,
        status: "ready",
        contentHash: expectedHash,
        dimensions: EMBEDDING_DIMENSIONS,
        vector: float32ToBuffer(vec),
      });

      const skipRes = await EmbeddingSyncService.syncProductEmbedding(77);
      expect(skipRes.status).toBe("skipped");
      expect(VectorIndexService.count).toBe(1);

      // Changed hash triggers embed + DB tx create
      const mockTx = { commit: jest.fn(), rollback: jest.fn() };
      jest.spyOn(db.sequelize, "transaction").mockResolvedValue(mockTx);
      jest.spyOn(db.ProductEmbedding, "findOne").mockResolvedValueOnce(null);
      const createSpy = jest
        .spyOn(db.ProductEmbedding, "create")
        .mockResolvedValue({ productId: 77, status: "ready" });
      jest
        .spyOn(geminiConfig.genAI.models, "embedContent")
        .mockResolvedValueOnce({ embeddings: [{ values: Array.from(makeBasisVector(4)) }] });

      const okRes = await EmbeddingSyncService.syncProductEmbedding(77, { includeImage: false });
      expect(okRes.status).toBe("succeeded");
      expect(mockTx.commit).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 77,
          status: "ready",
          dimensions: EMBEDDING_DIMENSIONS,
        }),
        { transaction: mockTx },
      );

      // Null embedding stores failed record
      jest.spyOn(db.ProductEmbedding, "findOne").mockResolvedValueOnce(null);
      jest
        .spyOn(geminiConfig.genAI.models, "embedContent")
        .mockRejectedValueOnce(Object.assign(new Error("404"), { status: 404 }))
        .mockRejectedValueOnce(Object.assign(new Error("404"), { status: 404 }));

      const failRes = await EmbeddingSyncService.syncProductEmbedding(77, {
        force: true,
        includeImage: false,
      });
      expect(failRes.status).toBe("failed");
      expect(createSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({ productId: 77, status: "failed" }),
        { transaction: mockTx },
      );
    });
  });

  describe("HybridSearchService RRF & VisionAIService", () => {
    test("HybridSearchService combines Vector + Lexical via RRF and falls back lexically when index is empty", async () => {
      jest.spyOn(ProductService, "filterProducts").mockResolvedValue({
        errCode: 0,
        data: [
          { id: 2, name: "Chuột Logitech MX", basePrice: 2100000 },
          { id: 1, name: "Laptop Ultrabook OLED", basePrice: 25000000 },
        ],
      });

      // 1. Empty index -> pure lexical fallback
      const lexOnly = await HybridSearchService.search("laptop mong nhe", { limit: 5 });
      expect(lexOnly.errCode).toBe(0);
      expect(lexOnly.meta.strategy).toBe("lexical_fallback");
      expect(lexOnly.products.map((p) => p.id)).toEqual([2, 1]);

      // 2. Populated index -> RRF boosts product 1 (in both) and hydrates vector-only product 3
      VectorIndexService.upsertVector(3, makeBasisVector(0, 1, 0.4), { basePrice: 22000000 });
      VectorIndexService.upsertVector(1, makeBasisVector(0, 1, 0.3), { basePrice: 25000000 });

      jest
        .spyOn(geminiConfig.genAI.models, "embedContent")
        .mockResolvedValue({ embeddings: [{ values: Array.from(makeBasisVector(0)) }] });
      jest.spyOn(db.Product, "findAll").mockResolvedValue([
        {
          toJSON: () => ({
            id: 3,
            name: "ASUS Zenbook 14 OLED",
            basePrice: 22000000,
            discount: 0,
            images: [{ imageUrl: "/zen.png", isPrimary: true }],
          }),
        },
      ]);

      const hybrid = await HybridSearchService.search("laptop làm việc mỏng nhẹ", { limit: 5 });
      expect(hybrid.meta.strategy).toBe("hybrid_rrf");
      // Product 1 appears at Vector rank 2 AND Lexical rank 2 -> highest combined RRF!
      expect(hybrid.products[0].id).toBe(1);
      expect(hybrid.products.some((p) => p.id === 3 && p.isSemanticMatch)).toBe(true);
    });

    test("VisionAIService extracts mimeType cleanly and searches via HybridSearchService even when Vision caption fails", async () => {
      jest
        .spyOn(geminiConfig.genAI.models, "generateContent")
        .mockRejectedValueOnce(new Error("Vision overloaded"));
      const searchSpy = jest
        .spyOn(HybridSearchService, "search")
        .mockResolvedValue({
          errCode: 0,
          products: [{ id: 9, name: "Tai nghe Sony XM5" }],
          meta: { strategy: "vector", vectorHits: 1, lexicalHits: 0 },
        });

      const res = await VisionAIService.visualSearch("data:image/png;base64,iVBORw0KGgo=");
      expect(res.errCode).toBe(0);
      expect(res.data.products).toHaveLength(1);
      expect(searchSpy).toHaveBeenCalledWith("", {
        imageBase64: "iVBORw0KGgo=",
        mimeType: "image/png",
        limit: 6,
      });
    });
  });
});
