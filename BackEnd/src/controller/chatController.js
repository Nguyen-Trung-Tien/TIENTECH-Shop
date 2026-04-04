require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Product, Order, Category, OrderItem, User } = require("../models");
const { Op } = require("sequelize");
const ProductService = require("../services/ProductService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
if (!process.env.GEMINI_API_KEY) {
  console.error("CRITICAL ERROR: GEMINI_API_KEY is missing in .env file!");
} else if (!process.env.GEMINI_API_KEY.startsWith("AIzaSy")) {
  console.error(
    "CRITICAL ERROR: GEMINI_API_KEY format seems invalid (should start with 'AIzaSy')",
  );
}
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

const extractJson = (text) => {
  try {
    // Try to parse directly first
    return JSON.parse(text);
  } catch (e) {
    // Fallback: extract JSON from markdown code blocks or curly braces
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        console.error("Failed to parse extracted JSON:", innerError);
      }
    }
    throw new Error("Could not parse AI response as JSON");
  }
};

const handleChat = async (req, res) => {
  try {
    const { message, userId, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Thiếu nội dung câu hỏi." });
    }

    let dbContext = "";
    let suggestedProducts = [];

    // 1. Tìm kiếm ngữ nghĩa (Semantic Search) - AI 2.0
    const semanticResult = await ProductService.searchSemanticProducts(
      message,
      4,
    );
    if (semanticResult.errCode === 0 && semanticResult.products.length > 0) {
      dbContext += "\nSản phẩm liên quan tìm thấy qua phân tích ý nghĩa:\n";
      semanticResult.products.forEach((p) => {
        suggestedProducts.push(p);
        dbContext += `- ID: ${p.id}, Tên: ${p.name}, Giá: ${formatPrice(p.price)}đ (Độ phù hợp: ${Math.round(p.similarity * 100)}%)\n`;
      });
    }

    // 2. Tìm kiếm theo từ khóa (Keyword Search) - Fallback
    if (suggestedProducts.length < 2) {
      const productMatch = message.match(
        /(?:sản phẩm|sp|mua|tìm|có|bán|giá) (.+)/i,
      );
      const queryName = productMatch ? productMatch[1].trim() : message;

      const keywordProducts = await Product.findAll({
        where: {
          name: { [Op.like]: `%${queryName}%` },
          isActive: true,
        },
        limit: 3,
      });

      if (keywordProducts.length > 0) {
        dbContext += "\nSản phẩm tìm thấy theo từ khóa:\n";
        keywordProducts.forEach((p) => {
          if (!suggestedProducts.find((sp) => sp.id === p.id)) {
            const discountPrice = p.price * (1 - (p.discount || 0) / 100);
            suggestedProducts.push({
              id: p.id,
              name: p.name,
              price: discountPrice,
              image: p.image,
            });
            dbContext += `- ID: ${p.id}, Tên: ${p.name}, Giá: ${formatPrice(discountPrice)}đ\n`;
          }
        });
      }
    }

    // Thêm thông tin đơn hàng gần nhất của người dùng
    if (userId) {
      const order = await Order.findOne({
        where: { userId },
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: OrderItem,
            as: "orderItems",
            include: [{ model: Product, as: "product" }],
          },
        ],
      });

      if (order) {
        const items = order.orderItems.map((i) => i.product.name).join(", ");
        dbContext += `\nĐơn hàng gần nhất (#${order.id}): Trạng thái ${translateStatus(order.status)}, SP: ${items}\n`;
      }
    }

    const systemPrompt = `
Bạn là trợ lý AI thông minh của TienTech Shop.
Nhiệm vụ: Trả lời câu hỏi khách hàng, tư vấn sản phẩm và hỗ trợ tra cứu đơn hàng.

DỮ LIỆU HỆ THỐNG:
${dbContext || "Không tìm thấy dữ liệu liên quan trực tiếp."}

YÊU CẦU PHẢN HỒI:
1. Luôn trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp.
2. Trả về định dạng JSON THUẦN với cấu trúc:
{
  "reply": "Nội dung câu trả lời của bạn",
  "recommendedProducts": [id1, id2] // Mảng ID các sản phẩm liên quan nếu có (tối đa 3)
}
3. Không markdown, không giải thích ngoài JSON.
`;

    // Chuẩn bị tin nhắn bao gồm lịch sử hội thoại
    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...history.slice(-6).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [
          {
            text:
              typeof msg.content === "string"
                ? msg.content
                : JSON.stringify(msg.content),
          },
        ],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    try {
      const resultGen = await model.generateContent({ contents });
      const responseText = resultGen.response.text();
      const result = extractJson(responseText);

      // Lấy thông tin chi tiết của các sản phẩm được đề xuất
      let finalRecommended = [];
      if (result.recommendedProducts && result.recommendedProducts.length > 0) {
        finalRecommended = await Product.findAll({
          where: {
            id: { [Op.in]: result.recommendedProducts },
            isActive: true,
          },
          attributes: ["id", "name", "price", "discount", "image"],
        });
      }

      res.json({
        reply: result.reply,
        recommendedProducts: finalRecommended,
      });
    } catch (err) {
      console.error("Gemini Error:", err);
      return res.json({
        reply: "AI đang bận, vui lòng thử lại sau giây lát ⏳",
        recommendedProducts: [],
      });
    }
  } catch (error) {
    console.error("Lỗi chatbot:", error);
    res.status(500).json({ error: "Lỗi hệ thống AI." });
  }
};

function formatPrice(price) {
  return parseFloat(price).toLocaleString("vi-VN");
}

function translateStatus(status) {
  const map = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipped: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };
  return map[status] || status;
}

module.exports = { handleChat };
