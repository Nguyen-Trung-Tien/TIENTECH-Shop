require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const ProductService = require("../services/product/ProductService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const handleVisualSearch = async (req, res) => {
  try {
    const { image } = req.body; // Base64 image string

    if (!image) {
      return res.status(400).json({ error: "Thiếu dữ liệu hình ảnh." });
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

    res.json({
      description,
      products: searchResult.errCode === 0 ? searchResult.products : []
    });

  } catch (error) {
    console.error("Visual Search Error:", error);
    res.status(500).json({ error: "Lỗi phân tích hình ảnh." });
  }
};

module.exports = { handleVisualSearch };
