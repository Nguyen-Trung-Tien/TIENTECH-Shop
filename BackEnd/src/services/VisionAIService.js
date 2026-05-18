const { GoogleGenerativeAI } = require("@google/generative-ai");
const ProductService = require("./product/ProductService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const visualSearch = async (image) => {
  try {
    if (!image) {
      return { errCode: 1, errMessage: "Thiếu dữ liệu hình ảnh.", data: null };
    }

    // 1. Dùng Gemini Vision để phân tích ảnh
    const prompt = "Mô tả ngắn gọn sản phẩm trong ảnh này để tôi tìm kiếm trong cơ sở dữ liệu. Chỉ trả về các từ khóa chính về loại sản phẩm, màu sắc, kiểu dáng.";
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: image.split(",")[1] || image,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const description = result.response.text();

    // 2. Dùng mô tả để tìm kiếm sản phẩm ngữ nghĩa
    const searchResult = await ProductService.searchSemanticProducts(description, 5);

    return {
      errCode: 0,
      errMessage: "OK",
      data: {
        description,
        products: searchResult.errCode === 0 ? searchResult.products : []
      }
    };

  } catch (error) {
    console.error("VisionAIService Error:", error);
    return { errCode: -1, errMessage: "Lỗi phân tích hình ảnh từ AI.", data: null };
  }
};

module.exports = { visualSearch };
