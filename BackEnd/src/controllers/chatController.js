require("dotenv").config();
const { Product, Order, OrderItem } = require("../models");
const ProductService = require("../services/product/ProductService");
const { generateContentWithFallback } = require("../config/gemini");
const SystemSettingService = require("../services/system/SystemSettingService");

const handleChat = async (req, res) => {
  try {
    const { message, userId, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Thiếu nội dung câu hỏi." });
    }

    const isAiEnabled = await SystemSettingService.getSetting("AI_BOT_ENABLED", true);
    if (isAiEnabled === false || isAiEnabled === "false") {
      return res.status(200).json({
        reply: "Trợ lý ảo AI hiện đang tạm ngưng phục vụ để nâng cấp hệ thống. Quý khách vui lòng liên hệ hotline 1900 6868 hoặc bộ phận CSKH để được hỗ trợ trực tiếp.",
        products: [],
      });
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
      const parseResult = await generateContentWithFallback(parserPrompt, {
        generationConfig: { responseMimeType: "application/json" },
      });
      intent = extractJson(parseResult.response.text());
    } catch (aiError) {
      console.error("Lỗi AI Intent Extraction:", aiError.message);
      // Fallback intent if AI fails
      intent = { semanticQuery: message };
    }

    let dbContext = "";
    let suggestedProducts = [];

    // 2. Thực hiện tìm kiếm kết hợp (Hybrid Search)
    if (intent.isOrderQuery && userId) {
      try {
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
          dbContext += `\nĐơn hàng #${order.id}: Trạng thái ${translateStatus(
            order.status
          )}, SP: ${order.orderItems.map((i) => i.product?.name).join(", ")}`;
        }
      } catch (dbError) {
        console.error("Lỗi DB Order Query:", dbError);
      }
    }

    // Tìm kiếm sản phẩm thông minh
    const filterOptions = {
      maxPrice: intent.maxPrice,
      minPrice: intent.minPrice,
      search: intent.semanticQuery || message,
      limit: 5,
    };

    try {
      const searchResult = await ProductService.filterProducts(filterOptions);
      if (
        searchResult.errCode === 0 &&
        searchResult.data &&
        searchResult.data.length > 0
      ) {
        dbContext += "\nSản phẩm tìm thấy:\n";
        searchResult.data.forEach((p) => {
          suggestedProducts.push(p);
          dbContext += `- ID: ${p.id}, Tên: ${p.name}, Giá: ${formatPrice(
            p.price || p.basePrice
          )}đ, Đặc điểm: ${p.description?.slice(0, 50)}...\n`;
        });
      }
    } catch (searchError) {
      console.error("Lỗi Product Search:", searchError);
    }

    // 3. Tạo phản hồi cuối cùng
    const systemPrompt = `
Bạn là trợ lý mua sắm AI của TIENTECH Shop.
DỮ LIỆU CÓ SẴN: ${dbContext || "Không tìm thấy SP phù hợp yêu cầu cụ thể."}

NHIỆM VỤ:
- Tư vấn nhiệt tình, thân thiện dựa trên dữ liệu hệ thống.
- Nếu không có SP đúng yêu cầu, hãy gợi ý SP gần nhất hoặc xin lỗi một cách lịch sự.
- TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON: {"reply": "câu trả lời", "recommendedProductIds": [id1, id2]}
`;

    try {
      const chatContents = [
        { role: "user", parts: [{ text: systemPrompt }] },
        ...history.slice(-4).map((h) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [
            {
              text:
                typeof h.content === "string"
                  ? h.content
                  : JSON.stringify(h.content),
            },
          ],
        })),
        { role: "user", parts: [{ text: message }] },
      ];

      const finalResult = await generateContentWithFallback(
        { contents: chatContents },
        { generationConfig: { responseMimeType: "application/json" } }
      );

      const finalJson = extractJson(finalResult.response.text());

      // Lấy thông tin chi tiết sản phẩm để hiển thị trên UI
      const products = suggestedProducts.filter((p) =>
        finalJson.recommendedProductIds?.includes(p.id)
      );

      return res.json({
        reply:
          finalJson.reply ||
          "TIENTECH rất sẵn lòng hỗ trợ quý khách! Bạn có thể mô tả chi tiết sản phẩm cần tìm không ạ?",
        recommendedProducts:
          products.length > 0 ? products : suggestedProducts.slice(0, 3),
      });
    } catch (finalAiError) {
      console.error("Lỗi AI Final Response:", finalAiError.message);
      return res.json({
        reply:
          "Chào bạn! Trợ lý AI đang xử lý nhiều lượt tư vấn cùng lúc. Bạn có thể xem ngay các sản phẩm gợi ý bên dưới hoặc liên hệ Hotline 1900 6868 nhé!",
        recommendedProducts: suggestedProducts.slice(0, 3),
      });
    }
  } catch (error) {
    console.error("Lỗi Assistant Tổng quát:", error);
    return res.status(500).json({ error: "Lỗi hệ thống AI." });
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
