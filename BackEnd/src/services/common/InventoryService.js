const db = require("../../models");
const { Op } = require("sequelize");
const NotificationService = require("../notification/NotificationService");
const { generateContentWithFallback } = require("../../config/gemini");

/**
 * Kiểm tra tồn kho và gửi cảnh báo nếu cần
 */
const checkInventoryAndAlert = async () => {
  try {
    const lowStockProducts = await db.Product.findAll({
      where: {
        isActive: true,
        totalStock: { [Op.lt]: 10 },
      },
      attributes: ["id", "name", "totalStock", "sold", "basePrice"],
    });

    if (lowStockProducts.length === 0) return { errCode: 0, message: "Tồn kho ổn định." };

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

    const result = await generateContentWithFallback(context, {
      generationConfig: { responseMimeType: "application/json" },
    });
    const aiResponse = JSON.parse(result.response.text().replace(/```json/gi, "").replace(/```/g, "").trim());

    for (const alert of aiResponse.alerts) {
      const product = lowStockProducts.find(p => p.id === alert.productId);
      if (product) {
        await NotificationService.createNotification({
          userId: 1,
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
