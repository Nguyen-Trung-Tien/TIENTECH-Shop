const db = require("../models");
const { Op } = require("sequelize");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const NotificationService = require("./NotificationService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Kiểm tra tồn kho và gửi cảnh báo nếu cần
 */
const checkInventoryAndAlert = async () => {
  try {
    // 1. Tìm các sản phẩm có tồn kho thấp (ví dụ < 10)
    const lowStockProducts = await db.Product.findAll({
      where: {
        isActive: true,
        totalStock: { [Op.lt]: 10 },
      },
      attributes: ["id", "name", "totalStock", "sold", "basePrice"],
    });

    if (lowStockProducts.length === 0) return { errCode: 0, message: "Tồn kho ổn định." };

    // 2. Dùng AI để phân tích độ ưu tiên nhập hàng
    const context = `
Bạn là chuyên gia quản lý kho. Dưới đây là danh sách sản phẩm sắp hết hàng:
${lowStockProducts.map(p => `- ${p.name}: Còn ${p.totalStock}, Đã bán ${p.sold}`).join("\n")}

Hãy phân tích và trả về danh sách các sản phẩm CẦN NHẬP GẤP (ưu tiên sản phẩm bán chạy).
Trả về JSON THUẦN:
{
  "alerts": [
    { "productId": 1, "priority": "HIGH|MEDIUM|LOW", "reason": "Lý do ngắn gọn" }
  ]
}
    `;

    const result = await geminiModel.generateContent(context);
    const aiResponse = JSON.parse(result.response.text().replace(/```json/gi, "").replace(/```/g, "").trim());

    // 3. Gửi thông báo cho Admin
    for (const alert of aiResponse.alerts) {
      const product = lowStockProducts.find(p => p.id === alert.productId);
      if (product) {
        await NotificationService.createNotification({
          userId: 1, // Giả định ID 1 là Admin chính
          title: `Cảnh báo tồn kho: ${product.name}`,
          content: `${alert.reason}. Hiện chỉ còn ${product.totalStock} sản phẩm. Độ ưu tiên: ${alert.priority}`,
          type: "system",
        });
      }
    }

    return { errCode: 0, message: "Đã gửi cảnh báo tồn kho.", data: aiResponse.alerts };
  } catch (error) {
    console.error("InventoryService Error:", error);
    return { errCode: -1, errMessage: "Lỗi kiểm tra tồn kho." };
  }
};

module.exports = { checkInventoryAndAlert };
