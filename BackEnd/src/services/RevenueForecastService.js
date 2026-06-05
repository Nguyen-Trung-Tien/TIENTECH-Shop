const db = require("../models");
const { Op } = require("sequelize");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY);
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json" },
});

const getRevenueForecast = async () => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // 1. Lấy dữ liệu doanh thu thực tế 12 tháng gần nhất
    const actualRevenueRaw = await db.Order.findAll({
      where: {
        createdAt: { [Op.gte]: twelveMonthsAgo },
        [Op.or]: [{ paymentStatus: "paid" }, { status: "delivered" }],
      },
      attributes: ["totalPrice", "createdAt"],
      raw: true,
    });

    const monthlyRevenue = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      monthlyRevenue[key] = 0;
    }

    actualRevenueRaw.forEach((order) => {
      const date = new Date(order.createdAt);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (monthlyRevenue[key] !== undefined) {
        monthlyRevenue[key] += Number(order.totalPrice);
      }
    });

    const historyData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    // 2. Chuẩn bị Prompt cho Gemini
    const context = `
Bạn là chuyên gia phân tích tài chính TMĐT. Dưới đây là dữ liệu doanh thu 12 tháng qua của cửa hàng TienTech:
${JSON.stringify(historyData)}

Nhiệm vụ:
1. Dự báo doanh thu cho 3 tháng tiếp theo.
2. Đề xuất ngân sách Marketing tối ưu (thường chiếm 5-10% doanh thu dự kiến).
3. Đưa ra 3 hành động chiến lược để đạt được mục tiêu đó.

Trả về JSON THUẦN:
{
  "forecast": [
    { "month": "Tháng/Năm", "predictedRevenue": 0, "confidence": "HIGH|MEDIUM|LOW" }
  ],
  "marketingBudget": { "amount": 0, "note": "Lý do đề xuất" },
  "strategicActions": [
    { "action": "Tên hành động", "impact": "Mô tả tác động" }
  ],
  "summary": "Tóm tắt tổng quan"
}
    `;

    const result = await geminiModel.generateContent(context);
    const responseText = result.response.text();
    
    // Làm sạch JSON
    const cleanJson = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const forecastData = JSON.parse(cleanJson);

    return {
      errCode: 0,
      data: {
        history: historyData,
        ...forecastData,
      },
    };
  } catch (error) {
    console.error("RevenueForecastService Error:", error);
    return { errCode: -1, errMessage: "Lỗi AI dự báo doanh thu." };
  }
};

module.exports = {
  getRevenueForecast,
};
