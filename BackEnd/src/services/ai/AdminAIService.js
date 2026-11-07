const db = require("../../models");
const { Op } = require("sequelize");
const { generateContentWithFallback } = require("../../config/gemini");
const { getCache, setCache } = require("../../config/redis");

const getAIInsights = async () => {
  const cacheKey = "admin_ai_insights";
  const cached = await getCache(cacheKey);
  if (cached) return cached;

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

    const generateHeuristicInsights = () => {
      const promo = slowMoving.map(
        (p) =>
          `Áp dụng voucher giảm giá 10-15% cho "${p.name}" (hiện còn tồn ${p.dataValues.stock || 0} sản phẩm)`
      );
      const restock = topSelling
        .filter((p) => (p.dataValues.stock || 0) < 20)
        .map(
          (p) =>
            `Nhập thêm lô hàng mới cho "${p.name}" (đã bán ${p.sold}, tồn kho sắp cạn: ${p.dataValues.stock || 0})`
        );
      if (restock.length === 0 && topSelling.length > 0) {
        restock.push(
          `Duy trì nguồn hàng ổn định cho top sản phẩm dẫn đầu doanh thu: ${topSelling[0].name}`
        );
      }

      return {
        promotionSuggestions: promo.length ? promo : ["Đẩy mạnh các gói combo phụ kiện đi kèm thiết bị chính."],
        restockSuggestions: restock,
        serviceReview:
          badReviews.length > 0
            ? `Cần chú ý cải thiện khâu đóng gói và thời gian phản hồi tin nhắn khách hàng (ghi nhận ${badReviews.length} đánh giá dưới 3 sao gần đây).`
            : "Chỉ số đánh giá khách hàng đang duy trì ở mức xuất sắc (trên 4 sao).",
        strategicAdvice:
          "Tập trung thúc đẩy vòng quay vốn bằng cách giải phóng các sản phẩm bán chậm và bảo đảm nguồn cung cho top sản phẩm bán chạy nhất.",
      };
    };

    let parsedData = null;
    let rawResponse = "";

    try {
      const context = `
Dữ liệu cửa hàng TienTech:
- Sản phẩm bán chạy: ${topSelling.map((p) => `${p.name} (Bán: ${p.sold}, Kho: ${p.dataValues.stock})`).join(", ")}
- Sản phẩm bán chậm: ${slowMoving.map((p) => `${p.name} (Bán: ${p.sold}, Kho: ${p.dataValues.stock}, Giá: ${p.dataValues.price})`).join(", ")}
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
      rawResponse = result.response.text();
      const match = rawResponse.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : rawResponse;
      parsedData = JSON.parse(jsonStr);
    } catch (aiErr) {
      console.warn(
        "[AdminAIService] Gemini AI unavailable, activating heuristic fallback:",
        aiErr.message
      );
      parsedData = generateHeuristicInsights();
      rawResponse = JSON.stringify(parsedData);
    }

    const responsePayload = {
      errCode: 0,
      data: {
        raw: rawResponse,
        parsed: parsedData,
      },
    };

    // Cache trong 2 giờ
    await setCache(cacheKey, responsePayload, 7200);
    return responsePayload;
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
