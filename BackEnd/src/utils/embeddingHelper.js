require("dotenv").config();
const crypto = require("crypto");
const { getGenAIClient } = require("../config/gemini");

const DEFAULT_EMBEDDING_MODEL = "gemini-embedding-2";
const FALLBACK_EMBEDDING_MODELS = ["gemini-embedding-2", "gemini-embedding-001"];
const EMBEDDING_DIMENSIONS = 768;

const normalizeVector = (vec) => {
  if (!vec || !vec.length) return new Float32Array(0);
  const f32 = vec instanceof Float32Array ? new Float32Array(vec) : Float32Array.from(vec);
  let normSq = 0;
  for (let i = 0; i < f32.length; i++) {
    normSq += f32[i] * f32[i];
  }
  if (normSq <= 0) return f32;
  const invNorm = 1 / Math.sqrt(normSq);
  for (let i = 0; i < f32.length; i++) {
    f32[i] *= invNorm;
  }
  return f32;
};

const float32ToBuffer = (vec) => {
  if (!vec || !vec.length) return Buffer.alloc(0);
  const f32 = vec instanceof Float32Array ? vec : Float32Array.from(vec);
  return Buffer.from(f32.buffer, f32.byteOffset, f32.byteLength);
};

const bufferToFloat32 = (buf, expectedDims = EMBEDDING_DIMENSIONS) => {
  if (!buf) return null;
  const view =
    buf instanceof Uint8Array
      ? buf
      : buf instanceof ArrayBuffer
        ? new Uint8Array(buf)
        : Buffer.isBuffer(buf)
          ? buf
          : null;
  if (!view || view.byteLength === 0 || view.byteLength % 4 !== 0) {
    return null;
  }
  if (expectedDims && view.byteLength !== expectedDims * 4) {
    return null;
  }
  const alignedCopy = new Uint8Array(view.byteLength);
  alignedCopy.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
  return new Float32Array(alignedCopy.buffer);
};

const dotProductNormalized = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecA.length !== vecB.length) return 0;
  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    sum += vecA[i] * vecB[i];
  }
  return sum;
};

const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length === 0 || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const buildProductEmbeddingText = (product) => {
  if (!product) return "";
  const parts = [];
  if (product.name) parts.push(`Sản phẩm: ${String(product.name).trim()}`);
  if (product.brand?.name) parts.push(`Thương hiệu: ${String(product.brand.name).trim()}`);
  if (product.category?.name) parts.push(`Danh mục: ${String(product.category.name).trim()}`);
  if (product.sku) parts.push(`Mã SKU: ${String(product.sku).trim()}`);
  if (product.description) {
    parts.push(`Mô tả: ${String(product.description).replace(/\s+/g, " ").trim()}`);
  }

  let specsObj = product.specifications;
  if (typeof specsObj === "string") {
    try {
      specsObj = JSON.parse(specsObj);
    } catch {
      // Keep raw string if not JSON
    }
  }
  if (specsObj && typeof specsObj === "object" && Object.keys(specsObj).length > 0) {
    const specText = Object.entries(specsObj)
      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
      .join(", ");
    parts.push(`Thông số: ${specText}`);
  } else if (typeof specsObj === "string" && specsObj.trim()) {
    parts.push(`Thông số: ${specsObj.trim()}`);
  }

  if (Array.isArray(product.attributes) && product.attributes.length > 0) {
    const attrText = product.attributes
      .map((a) => {
        const label = a?.attribute?.name || a?.attributeName || "";
        return label ? `${label}: ${a.value}` : a?.value;
      })
      .filter(Boolean)
      .join(", ");
    if (attrText) parts.push(`Thuộc tính: ${attrText}`);
  }

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const variantStrings = product.variants
      .filter((v) => v?.isActive !== false)
      .slice(0, 10)
      .map((v) => {
        if (v?.attributeValues && typeof v.attributeValues === "object") {
          return Object.entries(v.attributeValues)
            .map(([k, val]) => `${k}: ${val}`)
            .join("/");
        }
        return "";
      })
      .filter(Boolean);
    if (variantStrings.length > 0) {
      parts.push(`Phiên bản: ${variantStrings.join("; ")}`);
    }
  }

  return parts.join(". ").slice(0, 7000);
};

const computeProductContentHash = (product, primaryImageUrl = "") => {
  const canonical = JSON.stringify({
    model: DEFAULT_EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
    text: buildProductEmbeddingText(product),
    primaryImageUrl: String(primaryImageUrl || "").trim(),
  });
  return crypto.createHash("sha256").update(canonical).digest("hex");
};

const stripBase64Header = (raw) =>
  String(raw || "")
    .replace(/^data:[^;]+;base64,/i, "")
    .replace(/\s+/g, "")
    .trim();

/**
 * Tạo vector embedding đa phương thức (text + image) qua @google/genai gemini-embedding-2
 */
const generateMultimodalEmbedding = async ({
  text = "",
  imageBase64 = null,
  mimeType = "image/jpeg",
  taskType = "RETRIEVAL_DOCUMENT",
} = {}) => {
  try {
    const cleanText = String(text || "").replace(/\s+/g, " ").trim().slice(0, 8000);
    const cleanImage = imageBase64 ? stripBase64Header(imageBase64) : "";
    if (!cleanText && !cleanImage) return null;

    const ai = getGenAIClient();

    for (const model of FALLBACK_EMBEDDING_MODELS) {
      const supportsImage = model === "gemini-embedding-2";
      if (!supportsImage && !cleanText) {
        continue;
      }

      const contents =
        supportsImage && cleanImage
          ? {
              parts: [
                ...(cleanText ? [{ text: cleanText }] : []),
                {
                  inlineData: {
                    mimeType: mimeType || "image/jpeg",
                    data: cleanImage,
                  },
                },
              ],
            }
          : cleanText;

      try {
        const result = await ai.models.embedContent({
          model,
          contents,
          config: {
            taskType,
            outputDimensionality: EMBEDDING_DIMENSIONS,
          },
        });
        const values = result?.embeddings?.[0]?.values || result?.embedding?.values;
        if (Array.isArray(values) && values.length > 0) {
          const vector = normalizeVector(values);
          return {
            vector,
            model,
            dimensions: vector.length,
          };
        }
      } catch (modelErr) {
        const msg = String(modelErr?.message || "").toLowerCase();
        const status = Number(modelErr?.status || modelErr?.statusCode || 0);
        if (
          status === 404 ||
          status === 503 ||
          msg.includes("404") ||
          msg.includes("503") ||
          msg.includes("not found") ||
          msg.includes("unavailable")
        ) {
          continue;
        }
        throw modelErr;
      }
    }

    return null;
  } catch (error) {
    console.error("Lỗi khi tạo embedding với Gemini:", error.message || error);
    return null;
  }
};

/**
 * Tạo vector embedding từ văn bản sử dụng @google/genai (tương thích ngược)
 */
const generateEmbedding = async (text, taskType = "RETRIEVAL_DOCUMENT") => {
  const res = await generateMultimodalEmbedding({ text, taskType });
  return res?.vector ? Array.from(res.vector) : null;
};

module.exports = {
  DEFAULT_EMBEDDING_MODEL,
  FALLBACK_EMBEDDING_MODELS,
  EMBEDDING_DIMENSIONS,
  normalizeVector,
  float32ToBuffer,
  bufferToFloat32,
  dotProductNormalized,
  cosineSimilarity,
  buildProductEmbeddingText,
  computeProductContentHash,
  generateMultimodalEmbedding,
  generateEmbedding,
};
