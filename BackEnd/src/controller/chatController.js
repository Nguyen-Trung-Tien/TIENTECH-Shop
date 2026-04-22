require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Product, Order, Category, OrderItem, User } = require("../models");
const { Op } = require("sequelize");
const ProductService = require("../services/product/ProductService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");
if (!process.env.GEMINI_API_KEY) {
  console.error("CRITICAL ERROR: GEMINI_API_KEY is missing in .env file!");
} else if (!process.env.GEMINI_API_KEY.startsWith("AIzaSy")) {
  console.error(
    "CRITICAL ERROR: GEMINI_API_KEY format seems invalid (should start with 'AIzaSy')",
  );
}
const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview", 
  generationConfig: { responseMimeType: "application/json" },
});

const handleChat = async (req, res) => {
  try {
    const { message, userId, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Thiếu nội dung câu hỏi." });
    }

    // 1. Dùng AI để phân tích ý định (Intent Extraction)
    const parserPrompt = `
Phân tích câu hỏi người dùng và trả về JSON:
"message": "${message}"

Cấu trúc JSON yêu cầu:
{
  "category": "tên danh mục sản phẩm (nếu có)",
  "maxPrice": số (giá tối đa nếu có),
  "minPrice": số (giá tối thiểu nếu có),
  "attributes": ["màu sắc", "tính năng", "đối tượng sử dụng..."],
  "isOrderQuery": boolean (đang hỏi về đơn hàng?),
  "semanticQuery": "câu lệnh tối ưu để tìm kiếm ngữ nghĩa"
}
`;
    let intent = {};
    try {
        const parseResult = await model.generateContent(parserPrompt);
        intent = extractJson(parseResult.response.text());
    } catch (aiError) {
        console.error("Lỗi AI Intent Extraction:", aiError);
        // Fallback intent if AI fails
        intent = { semanticQuery: message };
    }

    let dbContext = "";
    let suggestedProducts = [];

    // 2. Thực hiện tìm kiếm kết hợp (Hybrid Search)
    if (intent.isOrderQuery && userId) {
        // Xử lý tra cứu đơn hàng (như cũ nhưng tối ưu hơn)
        try {
            const order = await Order.findOne({
                where: { userId },
                order: [["createdAt", "DESC"]],
                include: [{ model: OrderItem, as: "orderItems", include: [{ model: Product, as: "product" }] }],
            });
            if (order) dbContext += `\nĐơn hàng #${order.id}: Trạng thái ${translateStatus(order.status)}, SP: ${order.orderItems.map(i => i.product.name).join(", ")}`;
        } catch (dbError) {
            console.error("Lỗi DB Order Query:", dbError);
        }
    }

    // Tìm kiếm sản phẩm thông minh
    const filterOptions = {
        maxPrice: intent.maxPrice,
        minPrice: intent.minPrice,
        search: intent.semanticQuery || message,
        limit: 5
    };

    try {
        const searchResult = await ProductService.filterProducts(filterOptions);
        if (searchResult.errCode === 0 && searchResult.data && searchResult.data.length > 0) {
            dbContext += "\nSản phẩm tìm thấy:\n";
            searchResult.data.forEach(p => {
                suggestedProducts.push(p);
                dbContext += `- ID: ${p.id}, Tên: ${p.name}, Giá: ${formatPrice(p.price)}đ, Đặc điểm: ${p.description?.slice(0, 50)}...\n`;
            });
        }
    } catch (searchError) {
        console.error("Lỗi Product Search:", searchError);
    }

    // 3. Tạo phản hồi cuối cùng
    const systemPrompt = `
Bạn là trợ lý mua sắm AI của TienTech Shop.
DỮ LIỆU CÓ SẴN: ${dbContext || "Không tìm thấy SP phù hợp yêu cầu cụ thể."}

NHIỆM VỤ:
- Tư vấn nhiệt tình dựa trên dữ liệu hệ thống.
- Nếu không có SP đúng yêu cầu, hãy gợi ý SP gần nhất hoặc xin lỗi.
- TRẢ VỀ JSON: {"reply": "câu trả lời", "recommendedProductIds": [id1, id2]}
`;

    try {
        const finalResult = await model.generateContent({
            contents: [
                { role: "user", parts: [{ text: systemPrompt }] },
                ...history.slice(-4).map(h => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: typeof h.content === 'string' ? h.content : JSON.stringify(h.content) }] })),
                { role: "user", parts: [{ text: message }] }
            ]
        });

        const finalJson = extractJson(finalResult.response.text());
        
        // Lấy thông tin chi tiết sản phẩm để hiển thị trên UI
        const products = suggestedProducts.filter(p => finalJson.recommendedProductIds?.includes(p.id));

        res.json({
          reply: finalJson.reply || "Xin lỗi, tôi gặp chút khó khăn khi xử lý yêu cầu. Bạn có thể hỏi lại không?",
          recommendedProducts: products.length > 0 ? products : suggestedProducts.slice(0, 3)
        });
    } catch (finalAiError) {
        console.error("Lỗi AI Final Response:", finalAiError);
        res.json({
            reply: "Hệ thống AI đang bận hoặc hết hạn ngạch (Quota exceeded). Vui lòng thử lại sau vài giây hoặc liên hệ hỗ trợ.",
            recommendedProducts: suggestedProducts.slice(0, 3)
        });
    }

  } catch (error) {
    console.error("Lỗi Assistant Tổng quát:", error);
    res.status(500).json({ error: "Lỗi hệ thống AI." });
  }
};

function extractJson(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to extract JSON:", text);
    return {};
  }
}

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
