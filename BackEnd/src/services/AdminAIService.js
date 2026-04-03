const db = require("../models");
const { Op } = require("sequelize");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY);
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
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

    // Làm sạch JSON từ response của AI
    const cleanJson = response
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return {
      errCode: 0,
      data: JSON.parse(cleanJson),
    };
  } catch (error) {
    console.error("AI Insights Error:", error);
    return { errCode: -1, errMessage: "Lỗi khi AI phân tích dữ liệu." };
  }
};

module.exports = {
  getAIInsights,
};
