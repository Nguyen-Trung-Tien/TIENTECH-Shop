const axios = require("axios");
const { Op } = require("sequelize");
const db = require("../../models");
const { acquireLock, releaseLock, deleteCacheByPattern } = require("../../config/redis");
const VectorIndexService = require("./VectorIndexService");
const {
  DEFAULT_EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS,
  buildProductEmbeddingText,
  computeProductContentHash,
  generateMultimodalEmbedding,
  float32ToBuffer,
  bufferToFloat32,
} = require("../../utils/embeddingHelper");

const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const jobState = {
  running: false,
  mode: "missing",
  total: 0,
  processed: 0,
  succeeded: 0,
  skipped: 0,
  failed: 0,
  startedAt: null,
  finishedAt: null,
  lastError: null,
};

const resetJobState = (mode, total) => {
  jobState.running = true;
  jobState.mode = mode;
  jobState.total = total;
  jobState.processed = 0;
  jobState.succeeded = 0;
  jobState.skipped = 0;
  jobState.failed = 0;
  jobState.startedAt = new Date().toISOString();
  jobState.finishedAt = null;
  jobState.lastError = null;
};

const fetchPrimaryImageBase64 = async (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== "string") return null;
  if (!/^https?:\/\//i.test(imageUrl.trim())) return null;

  try {
    const response = await axios.get(imageUrl.trim(), {
      responseType: "arraybuffer",
      timeout: 4000,
      maxContentLength: 3 * 1024 * 1024,
    });
    const rawMime = String(response?.headers?.["content-type"] || "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    const mimeType = rawMime === "image/jpg" ? "image/jpeg" : rawMime;
    if (!ALLOWED_IMAGE_MIMES.has(mimeType)) {
      return null;
    }
    const base64 = Buffer.from(response.data).toString("base64");
    return base64 ? { base64, mimeType } : null;
  } catch {
    return null;
  }
};

const removeProductEmbedding = async (productId) => {
  const pid = Number(productId);
  if (!Number.isInteger(pid) || pid <= 0) return false;

  VectorIndexService.removeVector(pid);
  await VectorIndexService.publishEvent({ action: "remove", productId: pid }).catch(() => {});

  try {
    if (db.ProductEmbedding) {
      await db.ProductEmbedding.destroy({ where: { productId: pid } });
    }
    return true;
  } catch (error) {
    console.warn(`[EmbeddingSyncService.removeProductEmbedding] Product ${pid}:`, error?.message);
    return false;
  }
};

const syncProductEmbedding = async (
  productId,
  { force = false, includeImage = true } = {},
) => {
  const pid = Number(productId);
  if (!Number.isInteger(pid) || pid <= 0) {
    return { status: "failed", productId: pid, error: "Invalid productId" };
  }

  try {
    const product = await db.Product.findByPk(pid, {
      attributes: { exclude: ["embedding"] },
      include: [
        { model: db.Brand, as: "brand", attributes: ["id", "name"], required: false },
        { model: db.Category, as: "category", attributes: ["id", "name"], required: false },
        { model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"], required: false },
        {
          model: db.AttributeValue,
          as: "attributes",
          attributes: ["id", "value"],
          include: [{ model: db.Attribute, as: "attribute", attributes: ["name", "code"], required: false }],
          required: false,
        },
        {
          model: db.ProductVariant,
          as: "variants",
          attributes: ["id", "attributeValues", "isActive"],
          required: false,
        },
      ],
    });

    if (!product || !product.isActive) {
      await removeProductEmbedding(pid);
      return { status: "removed", productId: pid };
    }

    const plain = typeof product.get === "function" ? product.get({ plain: true }) : { ...product };
    const primaryImg =
      plain.images?.find((img) => img.isPrimary)?.imageUrl ||
      plain.images?.[0]?.imageUrl ||
      "";
    const text = buildProductEmbeddingText(plain);
    const contentHash = computeProductContentHash(plain, primaryImg);

    const existing = db.ProductEmbedding
      ? await db.ProductEmbedding.findOne({ where: { productId: pid } })
      : null;

    if (
      !force &&
      existing &&
      existing.status === "ready" &&
      existing.contentHash === contentHash &&
      existing.vector
    ) {
      const vec = bufferToFloat32(existing.vector, existing.dimensions || EMBEDDING_DIMENSIONS);
      if (vec) {
        VectorIndexService.upsertVector(pid, vec, {
          categoryId: plain.categoryId,
          brandId: plain.brandId,
          basePrice: plain.basePrice,
          discount: plain.discount,
          isActive: plain.isActive,
        });
      }
      return { status: "skipped", productId: pid, reason: "unchanged" };
    }

    const imgData =
      includeImage && primaryImg ? await fetchPrimaryImageBase64(primaryImg) : null;

    const embResult = await generateMultimodalEmbedding({
      text,
      imageBase64: imgData?.base64 || null,
      mimeType: imgData?.mimeType || "image/jpeg",
      taskType: "RETRIEVAL_DOCUMENT",
    });

    const meta = {
      categoryId: plain.categoryId,
      brandId: plain.brandId,
      basePrice: plain.basePrice,
      discount: plain.discount,
      isActive: plain.isActive,
    };

    if (db.ProductEmbedding) {
      const t = await db.sequelize.transaction();
      try {
        const recordPayload = embResult?.vector
          ? {
              productId: pid,
              model: embResult.model,
              dimensions: embResult.dimensions,
              vector: float32ToBuffer(embResult.vector),
              contentHash,
              status: "ready",
              errorMessage: null,
              indexedAt: new Date(),
            }
          : {
              productId: pid,
              model: DEFAULT_EMBEDDING_MODEL,
              dimensions: EMBEDDING_DIMENSIONS,
              contentHash,
              status: "failed",
              errorMessage: "Không thể tạo vector từ Gemini API",
            };

        if (existing) {
          await existing.update(recordPayload, { transaction: t });
        } else {
          await db.ProductEmbedding.create(recordPayload, { transaction: t });
        }
        await t.commit();
      } catch (txErr) {
        await t.rollback();
        throw txErr;
      }
    }

    if (!embResult?.vector) {
      return {
        status: "failed",
        productId: pid,
        error: "Không thể tạo vector từ Gemini API",
      };
    }

    VectorIndexService.upsertVector(pid, embResult.vector, meta);
    await VectorIndexService.publishEvent({
      action: "upsert",
      productId: pid,
      vector: embResult.vector,
      meta,
    }).catch(() => {});

    return { status: "succeeded", productId: pid };
  } catch (error) {
    console.error(`[EmbeddingSyncService.syncProductEmbedding] Product ${pid}:`, error);
    return { status: "failed", productId: pid, error: error?.message || "Sync error" };
  }
};

const syncAllProducts = async ({
  mode = "missing",
  batchSize = 5,
  io = null,
} = {}) => {
  if (jobState.running) {
    return {
      errCode: 409,
      statusCode: 409,
      errMessage: "Tiến trình đồng bộ AI Vector đang chạy. Vui lòng đợi hoàn tất.",
      data: { ...jobState },
    };
  }

  const lockToken = await acquireLock("vector:sync", 600, { failClosed: false });
  if (!lockToken) {
    return {
      errCode: 409,
      statusCode: 409,
      errMessage: "Một máy chủ khác đang thực hiện đồng bộ AI Vector.",
      data: { ...jobState },
    };
  }

  try {
    const activeProducts = await db.Product.findAll({
      where: { isActive: true },
      attributes: ["id"],
      order: [["id", "ASC"]],
      raw: true,
    });

    let targetIds = activeProducts.map((p) => p.id);

    if (mode === "missing" && db.ProductEmbedding) {
      const readyRows = await db.ProductEmbedding.findAll({
        where: {
          status: "ready",
          vector: { [Op.ne]: null },
        },
        attributes: ["productId"],
        raw: true,
      });
      const readySet = new Set(readyRows.map((r) => Number(r.productId)));
      targetIds = targetIds.filter((id) => !readySet.has(Number(id)));
    }

    const force = mode === "all";
    const safeBatchSize = Math.max(1, Math.min(20, Number(batchSize) || 5));

    resetJobState(mode, targetIds.length);
    io?.to("admin_room").emit("vector_sync_progress", { ...jobState });

    for (let i = 0; i < targetIds.length; i += safeBatchSize) {
      const batch = targetIds.slice(i, i + safeBatchSize);
      for (const pid of batch) {
        const res = await syncProductEmbedding(pid, { force, includeImage: true });
        jobState.processed += 1;
        if (res.status === "succeeded") jobState.succeeded += 1;
        else if (res.status === "skipped") jobState.skipped += 1;
        else {
          jobState.failed += 1;
          jobState.lastError = res.error || jobState.lastError;
        }
      }
      io?.to("admin_room").emit("vector_sync_progress", { ...jobState });
    }

    jobState.running = false;
    jobState.finishedAt = new Date().toISOString();
    io?.to("admin_room").emit("vector_sync_progress", { ...jobState });

    await Promise.allSettled([
      deleteCacheByPattern("smart_recs_*"),
      deleteCacheByPattern("semantic_embeddings*"),
    ]);

    return {
      errCode: 0,
      errMessage: `Đồng bộ hoàn tất (${mode}): ${jobState.succeeded} thành công, ${jobState.skipped} bỏ qua, ${jobState.failed} lỗi.`,
      message: `Đồng bộ hoàn tất: ${jobState.succeeded} thành công, ${jobState.skipped} bỏ qua, ${jobState.failed} lỗi.`,
      data: { ...jobState },
      successCount: jobState.succeeded,
      skippedCount: jobState.skipped,
      failCount: jobState.failed,
    };
  } catch (error) {
    jobState.running = false;
    jobState.finishedAt = new Date().toISOString();
    jobState.lastError = error?.message || "Sync failed";
    console.error("[EmbeddingSyncService.syncAllProducts] Error:", error);
    return {
      errCode: -1,
      errMessage: "Lỗi hệ thống khi đồng bộ AI Vector.",
      data: { ...jobState },
    };
  } finally {
    await releaseLock("vector:sync", lockToken);
  }
};

const getVectorOpsStatus = async () => {
  try {
    const totalActiveProducts = await db.Product.count({
      where: { isActive: true },
    });

    const counts = { ready: 0, pending: 0, failed: 0 };
    if (db.ProductEmbedding) {
      const rows = await db.ProductEmbedding.findAll({
        attributes: [
          "status",
          [db.sequelize.fn("COUNT", db.sequelize.col("id")), "count"],
        ],
        group: ["status"],
        raw: true,
      });
      for (const row of rows || []) {
        if (row.status && Object.prototype.hasOwnProperty.call(counts, row.status)) {
          counts[row.status] = Number(row.count || 0);
        }
      }
    }

    const coveragePct =
      totalActiveProducts > 0
        ? Math.min(100, Math.round((counts.ready / totalActiveProducts) * 100))
        : 0;

    return {
      errCode: 0,
      errMessage: "OK",
      data: {
        totalActiveProducts,
        counts,
        coveragePct,
        indexStats: VectorIndexService.getStats(),
        job: { ...jobState },
        model: DEFAULT_EMBEDDING_MODEL,
        dimensions: EMBEDDING_DIMENSIONS,
      },
    };
  } catch (error) {
    console.error("[EmbeddingSyncService.getVectorOpsStatus] Error:", error);
    return {
      errCode: -1,
      errMessage: "Không thể lấy trạng thái AI Vector Index.",
    };
  }
};

module.exports = {
  fetchPrimaryImageBase64,
  syncProductEmbedding,
  removeProductEmbedding,
  syncAllProducts,
  getVectorOpsStatus,
  getJobState: () => ({ ...jobState }),
};
