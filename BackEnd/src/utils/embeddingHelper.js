require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Sử dụng GEMINI_API_KEY hoặc API_KEY tùy vào cấu hình .env của bạn
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY);

/**
 * Tạo vector embedding từ văn bản sử dụng Google Gemini AI
 * @param {string} text - Văn bản cần tạo embedding
 * @returns {Promise<number[]>} - Mảng vector
 */
const generateEmbedding = async (text) => {
  try {
    if (!text || text.trim() === "") return null;

    // Giới hạn độ dài để tránh lỗi (Gemini hỗ trợ tốt văn bản dài, nhưng 8000 là mức an toàn)
    const sanitizedText = text.replace(/\n/g, " ").slice(0, 8000);

    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(sanitizedText);
    
    return result.embedding.values;
  } catch (error) {
    console.error("Lỗi khi tạo embedding với Gemini:", error.message || error);
    return null;
  }
};

/**
 * Tính toán độ tương đồng Cosine giữa 2 vector
 * @param {number[]} vecA - Vector A
 * @param {number[]} vecB - Vector B
 * @returns {number} - Giá trị tương đồng (0 đến 1)
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const normProduct = Math.sqrt(normA) * Math.sqrt(normB);
  return normProduct === 0 ? 0 : dotProduct / normProduct;
};

module.exports = {
  generateEmbedding,
  cosineSimilarity,
};
