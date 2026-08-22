const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "dummy_key";
const genAI = new GoogleGenerativeAI(apiKey);

// Fallback sequence when Google updates/deprecates model versions
const FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash-exp",
];

/**
 * Get generative model with given name and options
 */
const getGeminiModel = (modelName = "gemini-3.6-flash", options = {}) => {
  return genAI.getGenerativeModel({
    model: modelName,
    ...options,
  });
};

/**
 * Generate content with automatic model fallback on 404 or version obsolescence
 */
const generateContentWithFallback = async (contentsOrPrompt, options = {}) => {
  let preferredModel = "gemini-3.6-flash";
  try {
    const SystemSettingService = require("../services/system/SystemSettingService");
    preferredModel = (await SystemSettingService.getSetting("AI_MODEL_NAME")) || "gemini-3.6-flash";
  } catch {
    preferredModel = "gemini-3.6-flash";
  }

  // Deduplicate candidate models starting with preferred
  const candidateModels = [
    preferredModel,
    ...FALLBACK_MODELS.filter((m) => m !== preferredModel),
  ];

  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        ...options,
      });

      const result = await model.generateContent(contentsOrPrompt);
      return result;
    } catch (err) {
      lastError = err;
      const errMsg = err.message || "";
      const isModelNotFound =
        err.status === 404 ||
        errMsg.includes("404") ||
        errMsg.includes("not found") ||
        errMsg.includes("no longer available") ||
        errMsg.includes("deprecated");

      if (isModelNotFound) {
        console.warn(`[Gemini AI] Model '${modelName}' is unavailable. Trying fallback...`);
        continue;
      }

      // If it's another error (e.g., quota or prompt error), rethrow or continue
      console.warn(`[Gemini AI] Model '${modelName}' failed:`, errMsg);
      if (err.status === 429 || errMsg.includes("429") || errMsg.includes("quota")) {
        throw err;
      }
    }
  }

  throw lastError || new Error("All Gemini AI models failed to generate content.");
};

module.exports = {
  genAI,
  getGeminiModel,
  generateContentWithFallback,
  FALLBACK_MODELS,
};
