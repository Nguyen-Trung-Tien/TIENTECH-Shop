const db = require("../../models");
const { Op } = require("sequelize");
const { generateContentWithFallback } = require("../../config/gemini");

const getAIInsights = async () => {
  try {
    const topSelling = await db.Product.findAll({
      where: { isActive: true },
      order: [["sold", "DESC"]],
      limit: 5,
      attributes: ["name", "sold", ["totalStock", "stock"]],
    });

    const slowMoving = await db.Product.findAll({
      where: { isActive: true, totalStock: { [Op.gt]: 10 } },
      order: [["sold", "ASC"]],
      limit: 5,
      attributes: ["name", "sold", ["totalStock", "stock"], ["basePrice", "price"]],
    });

    const badReviews = await db.Review.findAll({
      where: { rating: { [Op.lte]: 3 } },
      order: [["createdAt", "DESC"]],
      limit: 5,
      attributes: ["comment", "rating"],
    });

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

    const result = await generateContentWithFallback(context, {
      generationConfig: { responseMimeType: "application/json" },
    });
    const response = result.response.text();

    let parsedData = null;
    try {
      const match = response.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : response;
      parsedData = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.warn("Failed to parse Gemini AI response as JSON:", parseErr.message);
    }

    return {
      errCode: 0,
      data: {
        raw: response,
        parsed: parsedData,
      },
    };
  } catch (error) {
    console.error("AI Insights Error:", error);
    return {
      errCode: 1,
      message: "Không thể tạo báo cáo AI lúc này. Vui lòng thử lại sau.",
      error: error.message,
    };
  }
};

const answerAdminQuery = async (query) => {
  try {
    const totalRevenue = await db.Order.sum("totalPrice", {
      where: { status: "delivered" },
    });
    const totalOrders = await db.Order.count();
    const totalUsers = await db.User.count();

    const context = `
Dữ liệu tổng quan hệ thống:
- Doanh thu tích luỹ: ${totalRevenue || 0} VND
- Tổng số đơn: ${totalOrders}
- Tổng số tài khoản: ${totalUsers}

Câu hỏi của Admin: "${query}"
Hãy trả lời chuyên nghiệp, súc tích và hỗ trợ ra quyết định.
    `;

    const result = await generateContentWithFallback(context);
    return {
      errCode: 0,
      answer: result.response.text(),
    };
  } catch (error) {
    console.error("Admin Query AI Error:", error);
    return {
      errCode: 1,
      message: "Lỗi xử lý câu hỏi AI.",
      error: error.message,
    };
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
