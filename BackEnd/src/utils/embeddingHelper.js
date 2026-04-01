require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Tạo vector embedding từ văn bản sử dụng OpenAI
 * @param {string} text - Văn bản cần tạo embedding
 * @returns {Promise<number[]>} - Mảng vector
 */
const generateEmbedding = async (text) => {
  try {
    if (!text || text.trim() === "") return null;
    
    // Giới hạn độ dài để tránh lỗi token (OpenAI hỗ trợ tối đa 8191 tokens cho text-embedding-3-small)
    const sanitizedText = text.replace(/\n/g, " ").slice(0, 8000);
    
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: sanitizedText,
      encoding_format: "float",
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Lỗi khi tạo embedding:", error);
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
