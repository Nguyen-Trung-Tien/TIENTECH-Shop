const db = require("../models");
const { Op } = require("sequelize");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY);
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const getAIInsights = async () => {
  try {
    // 1. Lấy top 5 sản phẩm bán chạy nhất
    const topSelling = await db.Product.findAll({
      where: { isActive: true },
      order: [["sold", "DESC"]],
      limit: 5,
      attributes: ["name", "sold", ["totalStock", "stock"]],
    });

    // 2. Lấy top 5 sản phẩm bán chậm (tồn kho nhiều nhưng sold ít)
    const slowMoving = await db.Product.findAll({
      where: { isActive: true, totalStock: { [Op.gt]: 10 } },
      order: [["sold", "ASC"]],
      limit: 5,
      attributes: ["name", "sold", ["totalStock", "stock"], ["basePrice", "price"]],
    });

    // 3. Lấy các đánh giá thấp gần đây (dưới 3 sao)
    const badReviews = await db.Review.findAll({
      where: { rating: { [Op.lte]: 3 } },
      order: [["createdAt", "DESC"]],
      limit: 5,
      attributes: ["comment", "rating"],
    });

    // 4. Chuẩn bị Context cho Gemini
    const context = `
Dữ liệu cửa hàng TienTech:
- Sản phẩm bán chạy: ${topSelling.map((p) => `${p.name} (Bán: ${p.sold}, Kho: ${p.stock})`).join(", ")}
- Sản phẩm bán chậm: ${slowMoving.map((p) => `${p.name} (Bán: ${p.sold}, Kho: ${p.stock}, Giá: ${p.price})`).join(", ")}
- Phản hồi tiêu cực gần đây: ${badReviews.map((r) => `[${r.rating} sao] ${r.comment}`).join(" | ")}

Hãy đóng vai chuyên gia tư vấn kinh doanh TMĐT. Hãy phân tích dữ liệu trên và đưa ra:
1. Gợi ý sản phẩm nào nên chạy chương trình Voucher giảm giá để đẩy hàng.
2. Gợi ý sản phẩm nào nên nhập thêm hàng.
3. Nhận xét về chất lượng dịch vụ dựa trên feedback.
4. Một lời khuyên chiến lược ngắn gọn cho tháng tới.

Trả về kết quả bằng tiếng Việt, súc tích, định dạng JSON:
{
  "promotionSuggestions": [],
  "restockSuggestions": [],
  "serviceReview": "",
  "strategicAdvice": ""
}
    `;

    const result = await geminiModel.generateContent(context);
    const response = result.response.text();

    // Safe JSON extraction and parsing
    let parsedData = null;
    try {
      const match = response.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : response;
      parsedData = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.warn("Failed to parse Gemini AI response as JSON:", parseErr.message);
      parsedData = {
        promotionSuggestions: topSelling.map((p) => `Khuyến mãi cho ${p.name}`),
        restockSuggestions: slowMoving.map((p) => `Cần xả kho ${p.name}`),
        serviceReview: "Dữ liệu phản hồi cần được theo dõi sát sao.",
        strategicAdvice: response.slice(0, 300),
      };
    }

    return {
      errCode: 0,
      data: parsedData,
    };
  } catch (error) {
    console.error("AI Insights Error:", error);
    return { errCode: -1, errMessage: "Lỗi khi AI phân tích dữ liệu." };
  }
};

const generateProductDescription = async (name, keywords = "") => {
  try {
    const context = `
Bạn là một chuyên gia Content Marketing và SEO chuyên nghiệp.
Hãy viết một đoạn mô tả sản phẩm thật hấp dẫn, thuyết phục và chuẩn SEO cho sản phẩm sau:

- Tên sản phẩm: ${name}
${keywords ? `- Từ khóa/Đặc điểm chính: ${keywords}` : ""}

Yêu cầu định dạng HTML:
- Sử dụng thẻ <h3> hoặc <h4> cho các tiêu đề phụ.
- Sử dụng thẻ <ul> và <li> cho các tính năng nổi bật.
- Sử dụng <strong> cho các từ khóa quan trọng.
- Viết thành 2-3 đoạn văn bản rõ ràng, súc tích nhưng đầy đủ thông tin.
- Không bao gồm thẻ <html>, <body>, <head>. Chỉ trả về phần nội dung bên trong.

Hãy tập trung vào lợi ích (benefits) mà sản phẩm mang lại cho người dùng, thay vì chỉ liệt kê tính năng (features).
    `;

    const result = await geminiModel.generateContent(context);
    let description = result.response.text();
    description = description.replace(/```html/gi, "").replace(/```/g, "").trim();

    return {
      errCode: 0,
      data: description,
    };
  } catch (error) {
    console.error("AI Description Error:", error);
    return { errCode: -1, errMessage: "Lỗi khi AI sinh mô tả sản phẩm." };
  }
};

module.exports = {
  getAIInsights,
  generateProductDescription,
};
