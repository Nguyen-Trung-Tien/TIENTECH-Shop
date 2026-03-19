require("dotenv").config();
const OpenAI = require("openai");
const { Product, Order, Category, OrderItem, User } = require("../models");
const { Op } = require("sequelize");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const handleChat = async (req, res) => {
  try {
    const { message, userId, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Thiếu nội dung câu hỏi." });
    }

    let dbContext = "";
    let suggestedProducts = [];

    // Tìm kiếm sản phẩm liên quan để cung cấp context cho AI
    const productMatch = message.match(/(?:sản phẩm|sp|mua|tìm|có|bán|giá) (.+)/i);
    if (productMatch) {
      const productName = productMatch[1].trim();
      const products = await Product.findAll({
        where: { 
          [Op.or]: [
            { name: { [Op.like]: `%${productName}%` } },
            { description: { [Op.like]: `%${productName}%` } }
          ],
          isActive: true 
        },
        include: [{ model: Category, as: "category" }],
        limit: 3
      });

      if (products.length > 0) {
        dbContext += "\nSản phẩm tìm thấy trong kho:\n";
        products.forEach(p => {
          const discountPrice = p.price * (1 - p.discount / 100);
          suggestedProducts.push({
            id: p.id,
            name: p.name,
            price: discountPrice,
            image: p.image,
            discount: p.discount
          });
          dbContext += `- ID: ${p.id}, Tên: ${p.name}, Giá: ${formatPrice(discountPrice)}đ, Kho: ${p.stock}\n`;
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

    // Chuẩn bị tin nhắn bao gồm lịch sử hội thoại (giới hạn 6 câu gần nhất để tiết kiệm token)
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6).map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      })),
      { role: "user", content: message }
    ];

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });
    } catch (err) {
      if (err.code === "rate_limit_exceeded") {
        return res.json({
          reply: "AI đang bận, vui lòng thử lại sau giây lát ⏳",
          recommendedProducts: []
        });
      }
      throw err;
    }

    const result = JSON.parse(completion.choices[0].message.content);
    
    // Lấy thông tin chi tiết của các sản phẩm được đề xuất
    let finalRecommended = [];
    if (result.recommendedProducts && result.recommendedProducts.length > 0) {
      finalRecommended = await Product.findAll({
        where: { id: { [Op.in]: result.recommendedProducts }, isActive: true },
        attributes: ['id', 'name', 'price', 'discount', 'image']
      });
    }

    res.json({ 
      reply: result.reply,
      recommendedProducts: finalRecommended
    });

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
    pending: "Chờ xử lý", confirmed: "Đã xác nhận",
    processing: "Đang xử lý", shipped: "Đang giao",
    delivered: "Đã giao", cancelled: "Đã hủy",
  };
  return map[status] || status;
}

module.exports = { handleChat };
