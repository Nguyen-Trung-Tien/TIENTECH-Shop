const crypto = require("crypto");
const { Op } = require("sequelize");
const db = require("../../models");
const { redisClient, isRedisConnected } = require("../../config/redis");
const {
  EMBEDDING_DIMENSIONS,
  normalizeVector,
  float32ToBuffer,
  bufferToFloat32,
} = require("../../utils/embeddingHelper");

const VECTOR_CHANNEL = "tientech:vector:events";
const INITIAL_CAPACITY = 64;

const parseIdFilter = (val) => {
  if (val === undefined || val === null || val === "") return null;
  const arr = Array.isArray(val) ? val : String(val).split(",");
  const ids = arr
    .map((item) => Number(String(item).trim()))
    .filter((num) => Number.isInteger(num) && num > 0);
  return ids.length > 0 ? new Set(ids) : null;
};

class VectorIndexService {
  constructor(dimensions = EMBEDDING_DIMENSIONS) {
    this.dimensions = dimensions;
    this.capacity = INITIAL_CAPACITY;
    this.matrix = new Float32Array(this.capacity * this.dimensions);
    this.productIds = [];
    this.idToSlot = new Map();
    this.metaById = new Map();
    this.count = 0;
    this.lastLoadedAt = null;
    this.isLoaded = false;
    this.subClient = null;
    this.instanceId = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  _ensureCapacity(targetCount) {
    if (targetCount <= this.capacity) return;
    const nextCapacity = Math.max(this.capacity * 2, targetCount);
    const nextMatrix = new Float32Array(nextCapacity * this.dimensions);
    if (this.count > 0) {
      nextMatrix.set(this.matrix.subarray(0, this.count * this.dimensions));
    }
    this.matrix = nextMatrix;
    this.capacity = nextCapacity;
  }

  clear() {
    this.capacity = INITIAL_CAPACITY;
    this.matrix = new Float32Array(this.capacity * this.dimensions);
    this.productIds = [];
    this.idToSlot = new Map();
    this.metaById = new Map();
    this.count = 0;
    this.lastLoadedAt = null;
    this.isLoaded = false;
  }

  upsertVector(productId, vector, meta = {}) {
    const pid = Number(productId);
    if (!Number.isInteger(pid) || pid <= 0) return false;

    const normalized = normalizeVector(vector);
    if (!normalized || normalized.length !== this.dimensions) return false;

    const normalizedMeta = {
      categoryId: meta?.categoryId != null ? Number(meta.categoryId) : null,
      brandId: meta?.brandId != null ? Number(meta.brandId) : null,
      basePrice: meta?.basePrice != null ? Number(meta.basePrice) : 0,
      discount: meta?.discount != null ? Number(meta.discount) : 0,
      isActive: meta?.isActive !== false,
    };

    if (this.idToSlot.has(pid)) {
      const slot = this.idToSlot.get(pid);
      this.matrix.set(normalized, slot * this.dimensions);
      this.metaById.set(pid, normalizedMeta);
      return true;
    }

    this._ensureCapacity(this.count + 1);
    const slot = this.count;
    this.count += 1;
    this.productIds[slot] = pid;
    this.idToSlot.set(pid, slot);
    this.matrix.set(normalized, slot * this.dimensions);
    this.metaById.set(pid, normalizedMeta);
    return true;
  }

  removeVector(productId) {
    const pid = Number(productId);
    const slot = this.idToSlot.get(pid);
    if (slot === undefined) return false;

    const lastSlot = this.count - 1;
    if (slot !== lastSlot) {
      const lastPid = this.productIds[lastSlot];
      const lastSlice = this.matrix.subarray(
        lastSlot * this.dimensions,
        (lastSlot + 1) * this.dimensions,
      );
      this.matrix.set(lastSlice, slot * this.dimensions);
      this.productIds[slot] = lastPid;
      this.idToSlot.set(lastPid, slot);
    }

    this.matrix.fill(
      0,
      lastSlot * this.dimensions,
      (lastSlot + 1) * this.dimensions,
    );
    this.productIds.length = lastSlot;
    this.idToSlot.delete(pid);
    this.metaById.delete(pid);
    this.count = lastSlot;
    return true;
  }

  async loadFromDatabase() {
    try {
      this.clear();

      if (db.ProductEmbedding && db.Product) {
        const rows = await db.ProductEmbedding.findAll({
          where: {
            status: "ready",
            vector: { [Op.ne]: null },
          },
          include: [
            {
              model: db.Product,
              as: "product",
              where: { isActive: true },
              attributes: [
                "id",
                "categoryId",
                "brandId",
                "basePrice",
                "discount",
                "isActive",
              ],
              required: true,
            },
          ],
        });

        for (const row of rows) {
          const vec = bufferToFloat32(row.vector, this.dimensions);
          if (vec && row.product) {
            this.upsertVector(row.productId, vec, row.product);
          }
        }
      }

      // Read-only fallback from legacy Products.embedding column if ProductEmbeddings is empty
      if (this.count === 0 && db.Product) {
        const legacyProducts = await db.Product.findAll({
          where: {
            isActive: true,
            embedding: { [Op.ne]: null },
          },
          attributes: [
            "id",
            "categoryId",
            "brandId",
            "basePrice",
            "discount",
            "isActive",
            "embedding",
          ],
          limit: 500,
        });

        for (const prod of legacyProducts) {
          try {
            const parsed =
              typeof prod.embedding === "string"
                ? JSON.parse(prod.embedding)
                : prod.embedding;
            if (Array.isArray(parsed) && parsed.length === this.dimensions) {
              this.upsertVector(prod.id, parsed, prod);
            }
          } catch {
            // Skip malformed legacy JSON embedding
          }
        }
      }

      this.isLoaded = true;
      this.lastLoadedAt = new Date().toISOString();
      return this.count;
    } catch (error) {
      console.error("[VectorIndexService.loadFromDatabase] Error:", error?.message);
      return this.count;
    }
  }

  searchByVector(
    queryVector,
    {
      limit = 10,
      minScore = 0.25,
      excludeIds = [],
      categoryId,
      brandId,
      minPrice,
      maxPrice,
    } = {},
  ) {
    if (this.count === 0) return [];
    const qVec = normalizeVector(queryVector);
    if (!qVec || qVec.length !== this.dimensions) return [];

    const excludeSet = new Set(
      (Array.isArray(excludeIds) ? excludeIds : []).map((x) => Number(x)),
    );
    const categoryFilter = parseIdFilter(categoryId);
    const brandFilter = parseIdFilter(brandId);
    const hasMinPrice =
      minPrice !== undefined && minPrice !== null && minPrice !== "";
    const hasMaxPrice =
      maxPrice !== undefined && maxPrice !== null && maxPrice !== "";
    const minP = hasMinPrice ? Number(minPrice) : 0;
    const maxP = hasMaxPrice ? Number(maxPrice) : Infinity;

    const dims = this.dimensions;
    const hits = [];

    for (let slot = 0; slot < this.count; slot++) {
      const pid = this.productIds[slot];
      if (excludeSet.has(pid)) continue;

      const meta = this.metaById.get(pid);
      if (meta && meta.isActive === false) continue;
      if (categoryFilter && (!meta || !categoryFilter.has(meta.categoryId))) {
        continue;
      }
      if (brandFilter && (!meta || !brandFilter.has(meta.brandId))) {
        continue;
      }
      if (hasMinPrice && (!meta || meta.basePrice < minP)) continue;
      if (hasMaxPrice && (!meta || meta.basePrice > maxP)) continue;

      const offset = slot * dims;
      let dot = 0;
      for (let i = 0; i < dims; i++) {
        dot += qVec[i] * this.matrix[offset + i];
      }

      if (dot >= minScore) {
        hits.push({ productId: pid, score: Number(dot.toFixed(6)) });
      }
    }

    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, Math.max(1, Number(limit) || 10));
  }

  getSimilarByProductId(productId, options = {}) {
    const pid = Number(productId);
    const slot = this.idToSlot.get(pid);
    if (slot === undefined) return [];

    const offset = slot * this.dimensions;
    const vec = this.matrix.subarray(offset, offset + this.dimensions);
    return this.searchByVector(vec, {
      ...options,
      excludeIds: [...(options.excludeIds || []), pid],
    });
  }

  getStats() {
    return {
      inMemoryCount: this.count,
      dimensions: this.dimensions,
      isLoaded: this.isLoaded,
      lastLoadedAt: this.lastLoadedAt,
      estimatedMemoryBytes: this.matrix.byteLength,
    };
  }

  async publishEvent(payload = {}) {
    if (process.env.NODE_ENV === "test") return false;
    if (!isRedisConnected() || !redisClient || typeof redisClient.publish !== "function") {
      return false;
    }

    try {
      const { vector, ...rest } = payload;
      const message = {
        ...rest,
        instanceId: this.instanceId,
        ...(vector ? { vectorBase64: float32ToBuffer(vector).toString("base64") } : {}),
      };
      await redisClient.publish(VECTOR_CHANNEL, JSON.stringify(message));
      return true;
    } catch (error) {
      console.warn("[VectorIndexService.publishEvent] Warning:", error?.message);
      return false;
    }
  }

  async initPubSub() {
    if (process.env.NODE_ENV === "test") return false;
    if (this.subClient || !isRedisConnected() || !redisClient) return false;

    try {
      const sub = redisClient.duplicate();
      sub.on("error", (err) => {
        console.warn("[VectorIndexService PubSub] Error:", err?.message);
      });
      await sub.connect();
      await sub.subscribe(VECTOR_CHANNEL, (rawMessage) => {
        try {
          const msg = JSON.parse(rawMessage);
          if (!msg || msg.instanceId === this.instanceId) return;

          if (msg.action === "upsert" && msg.productId && msg.vectorBase64) {
            const vec = bufferToFloat32(
              Buffer.from(msg.vectorBase64, "base64"),
              this.dimensions,
            );
            if (vec) {
              this.upsertVector(msg.productId, vec, msg.meta || {});
            }
          } else if (msg.action === "remove" && msg.productId) {
            this.removeVector(msg.productId);
          } else if (msg.action === "reload") {
            this.loadFromDatabase().catch(() => {});
          }
        } catch (parseErr) {
          console.warn("[VectorIndexService PubSub] Parse error:", parseErr?.message);
        }
      });

      this.subClient = sub;
      return true;
    } catch (error) {
      console.warn("[VectorIndexService.initPubSub] Warning:", error?.message);
      this.subClient = null;
      return false;
    }
  }

  async shutdown() {
    if (!this.subClient) return;
    const sub = this.subClient;
    this.subClient = null;
    try {
      if (typeof sub.unsubscribe === "function") {
        await sub.unsubscribe(VECTOR_CHANNEL);
      }
      if (typeof sub.quit === "function") {
        await sub.quit();
      }
    } catch {
      // Ignore shutdown errors
    }
  }
}

module.exports = new VectorIndexService();
module.exports.VectorIndexService = VectorIndexService;
module.exports.VECTOR_CHANNEL = VECTOR_CHANNEL;
