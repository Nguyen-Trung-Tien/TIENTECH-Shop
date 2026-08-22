const ProductService = require("../product/ProductService");
const { generateContentWithFallback } = require("../../config/gemini");

const visualSearch = async (image) => {
  try {
    if (!image) {
      return { errCode: 1, errMessage: "Thiếu dữ liệu hình ảnh.", data: null };
    }

    const prompt = "Mô tả ngắn gọn sản phẩm trong ảnh này để tôi tìm kiếm trong cơ sở dữ liệu. Chỉ trả về các từ khóa chính về loại sản phẩm, màu sắc, kiểu dáng.";
    
    const result = await generateContentWithFallback([
      prompt,
      {
        inlineData: {
          data: image.split(",")[1] || image,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const description = result.response.text();

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
