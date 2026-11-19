const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "dummy_key";
const genAI = new GoogleGenAI({ apiKey });

const DEFAULT_MODEL = "gemini-3.8-flash";
const FALLBACK_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash-lite"];

const DEPRECATED_MODELS = new Set([
  "gemini-pro",
  "gemini-1.0-pro",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-3.6-flash",
  "text-embedding-004",
]);

const getGenAIClient = () => genAI;

const normalizeContents = (contentsOrPrompt) => {
  if (
    contentsOrPrompt &&
    typeof contentsOrPrompt === "object" &&
    !Array.isArray(contentsOrPrompt) &&
    contentsOrPrompt.contents !== undefined
  ) {
    return contentsOrPrompt.contents;
  }
  return contentsOrPrompt;
};

const normalizeConfig = (options = {}) => {
  const merged = {
    ...(options.generationConfig || {}),
    ...(options.config || {}),
  };
  if (options.systemInstruction !== undefined && merged.systemInstruction === undefined) {
    merged.systemInstruction = options.systemInstruction;
  }
  return Object.keys(merged).length > 0 ? merged : undefined;
};

const wrapResponse = (raw) => {
  const textValue =
    typeof raw?.text === "function"
      ? raw.text()
      : typeof raw?.text === "string"
        ? raw.text
        : typeof raw?.response?.text === "function"
          ? raw.response.text()
          : "";

  return {
    text: textValue,
    response: {
      text: () => textValue,
    },
    raw,
  };
};

const isModelRetryableError = (err) => {
  const status = Number(err?.status || err?.statusCode || 0);
  const msg = String(err?.message || "").toLowerCase();

  // Never retry auth, bad request, or rate-limit errors on another model
  if ([400, 401, 403, 429].includes(status)) return false;
  if (msg.includes("429") || msg.includes("quota") || msg.includes("api key")) {
    return false;
  }

  return (
    status === 404 ||
    status === 503 ||
    msg.includes("404") ||
    msg.includes("503") ||
    msg.includes("not found") ||
    msg.includes("no longer available") ||
    msg.includes("deprecated") ||
    msg.includes("unavailable")
  );
};

/**
 * Generate content using @google/genai with automatic fallback on model unavailability (404/503).
 */
const generateContentWithFallback = async (contentsOrPrompt, options = {}) => {
  let preferredModel = DEFAULT_MODEL;
  try {
    const SystemSettingService = require("../services/system/SystemSettingService");
    const configuredModel = await SystemSettingService.getSetting("AI_MODEL_NAME");
    const normalizedModel = String(configuredModel || "").trim();
    if (normalizedModel && !DEPRECATED_MODELS.has(normalizedModel)) {
      preferredModel = normalizedModel;
    }
  } catch {
    preferredModel = DEFAULT_MODEL;
  }

  const candidateModels = [
    preferredModel,
    ...FALLBACK_MODELS.filter((m) => m !== preferredModel),
  ];

  const contents = normalizeContents(contentsOrPrompt);
  const config = normalizeConfig(options);

  let lastError = null;
  for (const modelName of candidateModels) {
    try {
      const request = {
        model: modelName,
        contents,
        ...(config ? { config } : {}),
      };
      const raw = await genAI.models.generateContent(request);
      return wrapResponse(raw);
    } catch (err) {
      lastError = err;
      if (isModelRetryableError(err)) {
        console.warn(`[Gemini AI] Model '${modelName}' is unavailable. Trying fallback...`);
        continue;
      }
      console.warn(`[Gemini AI] Model '${modelName}' failed:`, err?.message || err);
      throw err;
    }
  }

  throw lastError || new Error("All Gemini AI models failed to generate content.");
};

module.exports = {
  genAI,
  getGenAIClient,
  generateContentWithFallback,
  DEFAULT_MODEL,
  FALLBACK_MODELS,
};
