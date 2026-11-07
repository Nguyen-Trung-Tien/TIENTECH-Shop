const db = require("../../models");
const { Op } = require("sequelize");
const { generateContentWithFallback } = require("../../config/gemini");
const { getCache, setCache } = require("../../config/redis");

/**
 * Thuật toán dự phòng thống kê chu kỳ (Heuristic Fallback per AGENTS.md Rule 4.3)
 * Dự báo 3 tháng dựa trên bình quân trượt có trọng số và tỷ lệ tăng trưởng.
 */
const generateHeuristicForecast = (historyData) => {
  const revenues = historyData.map((h) => Number(h.revenue) || 0);
  const n = revenues.length;
  // Lấy 3 tháng gần nhất
  const last3 = revenues.slice(-3);
  const avgLast3 = last3.reduce((a, b) => a + b, 0) / (last3.length || 1);
  const growthRate = 1.05; // Dự kiến tăng trưởng 5%

  const now = new Date();
  const forecast = [];
  for (let i = 1; i <= 3; i++) {
    const nextDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthKey = `${nextDate.getMonth() + 1}/${nextDate.getFullYear()}`;
    const predicted = Math.round(avgLast3 * Math.pow(growthRate, i));
    forecast.push({
      month: monthKey,
      predictedRevenue: predicted > 0 ? predicted : 50000000,
      confidence: "MEDIUM",
    });
  }

  const avgPredicted = forecast.reduce((a, b) => a + b.predictedRevenue, 0) / 3;
  const marketingBudget = {
    amount: Math.round(avgPredicted * 0.08),
    note: "Đề xuất 8% doanh thu bình quân dự kiến phân bổ cho chiến dịch Marketing đa kênh.",
  };

  const strategicActions = [
    {
      action: "Tối ưu hóa phễu chuyển đổi & Remarketing",
      impact: "Tăng 12% tỷ lệ quay lại của khách hàng cũ qua email và voucher cá nhân hóa.",
    },
    {
      action: "Đẩy mạnh các SKU chủ lực tồn kho cao",
      impact: "Giảm 25% thời gian lưu kho và cải thiện vòng quay vốn lưu động.",
    },
    {
      action: "Tập trung chiến dịch khuyến mãi Flash Sale cuối tuần",
      impact: "Tăng lưu lượng truy cập và giá trị trung bình trên mỗi đơn hàng (AOV).",
    },
  ];

  return {
    forecast,
    marketingBudget,
    strategicActions,
    summary:
      "Dự báo được tính toán tự động dựa trên thuật toán bình quân trượt 3 tháng gần nhất (Heuristic Fallback).",
  };
};

const getRevenueForecast = async () => {
  const cacheKey = "admin_revenue_forecast";
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Dùng SQL Group By theo tháng thay vì kéo toàn bộ Order về Node.js RAM
    const monthlyOrders = await db.Order.findAll({
      where: {
        createdAt: { [Op.gte]: twelveMonthsAgo },
        [Op.or]: [{ paymentStatus: "paid" }, { status: "delivered" }],
      },
      attributes: [
        [
          db.sequelize.fn("DATE_FORMAT", db.sequelize.col("createdAt"), "%Y-%m"),
          "monthKey",
        ],
        [
          db.sequelize.fn("SUM", db.sequelize.col("totalPrice")),
          "totalRevenue",
        ],
      ],
      group: [
        db.sequelize.fn("DATE_FORMAT", db.sequelize.col("createdAt"), "%Y-%m"),
      ],
      raw: true,
    });

    const revenueMap = new Map();
    monthlyOrders.forEach((row) => {
      if (row.monthKey) {
        revenueMap.set(row.monthKey, Number(row.totalRevenue) || 0);
      }
    });

    const historyData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const keyDb = `${year}-${month}`;
      const label = `${d.getMonth() + 1}/${year}`;
      historyData.push({
        month: label,
        revenue: revenueMap.get(keyDb) || 0,
      });
    }

    let forecastData = null;
    try {
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

      const result = await generateContentWithFallback(context, {
        generationConfig: { responseMimeType: "application/json" },
      });
      const responseText = result.response.text();
      const cleanJson = responseText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      forecastData = JSON.parse(cleanJson);
    } catch (aiError) {
      console.warn(
        "[RevenueForecastService] Gemini AI unavailable, activating heuristic fallback:",
        aiError.message
      );
      forecastData = generateHeuristicForecast(historyData);
    }

    const finalResult = {
      errCode: 0,
      data: {
        history: historyData,
        ...forecastData,
      },
    };

    // Cache kết quả dự báo trong 2 giờ (7200s)
    await setCache(cacheKey, finalResult, 7200);
    return finalResult;
  } catch (error) {
    console.error("RevenueForecastService Error:", error);
    return { errCode: -1, errMessage: "Lỗi dự báo doanh thu." };
  }
};

module.exports = {
  getRevenueForecast,
};
