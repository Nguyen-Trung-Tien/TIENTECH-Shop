const HybridSearchService = require("./HybridSearchService");
const { generateContentWithFallback } = require("../../config/gemini");

const parseImageInput = (rawImage) => {
  const str = String(rawImage || "").trim();
  const dataUriMatch = str.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/is);
  if (dataUriMatch) {
    const rawMime = dataUriMatch[1].toLowerCase();
    return {
      mimeType: rawMime === "image/jpg" ? "image/jpeg" : rawMime,
      cleanBase64: dataUriMatch[2].replace(/\s+/g, ""),
    };
  }
  return {
    mimeType: "image/jpeg",
    cleanBase64: str.replace(/\s+/g, ""),
  };
};

const visualSearch = async (image) => {
  try {
    if (!image) {
      return { errCode: 1, errMessage: "Thiếu dữ liệu hình ảnh.", data: null };
    }

    const { mimeType, cleanBase64 } = parseImageInput(image);
    const prompt =
      "Mô tả ngắn gọn sản phẩm công nghệ trong ảnh này để tìm kiếm trong cơ sở dữ liệu (tên dòng máy, loại thiết bị, màu sắc, kiểu dáng). Trả về ngắn gọn không giải thích dài dòng.";

    let description = "";
    try {
      const result = await generateContentWithFallback([
        prompt,
        {
          inlineData: {
            data: cleanBase64,
            mimeType,
          },
        },
      ]);
      description = result?.response?.text?.()?.trim?.() || "";
    } catch (visionErr) {
      console.warn(
        "[VisionAIService] Caption fallback to direct multimodal vector search:",
        visionErr?.message,
      );
    }

    const searchResult = await HybridSearchService.search(description, {
      imageBase64: cleanBase64,
      mimeType,
      limit: 6,
    });

    const products = Array.isArray(searchResult?.products) ? searchResult.products : [];
    if (!description && products.length === 0) {
      return {
        errCode: -1,
        errMessage: "Lỗi phân tích hình ảnh từ AI.",
        data: null,
      };
    }

    return {
      errCode: 0,
      errMessage: "OK",
      data: {
        description: description || "Tìm kiếm trực quan bằng AI Vector",
        products,
        meta: searchResult?.meta,
      },
    };
  } catch (error) {
    console.error("VisionAIService Error:", error);
    return { errCode: -1, errMessage: "Lỗi phân tích hình ảnh từ AI.", data: null };
  }
};

module.exports = { visualSearch, parseImageInput };
