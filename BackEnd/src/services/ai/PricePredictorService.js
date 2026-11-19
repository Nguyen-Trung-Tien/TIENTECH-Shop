const db = require("../../models");
const { generateContentWithFallback } = require("../../config/gemini");

const analyzeProductWithGemini = async (product) => {
  const currentMonth = new Date().getMonth() + 1;
  const effectivePrice = Number(product.basePrice || product.price || 0);
  const prompt = `
Bạn là chuyên gia phân tích thị trường công nghệ. Hãy phân tích sản phẩm:
Tên: ${product.name}
Giá hiện tại: ${effectivePrice}đ
Giảm giá: ${product.discount || 0}%
Danh mục: ${product.category?.name || "Không có"}
Tháng hiện tại: ${currentMonth}

Dựa trên vòng đời sản phẩm (Product Life Cycle) và các sự kiện mua sắm lớn tại Việt Nam (Shopee 11.11, Black Friday, Tết, chu kỳ ra mắt iPhone/Laptop mới):
1. Dự đoán xu hướng giá 30, 60, 90 ngày tới.
2. Đưa ra "Fair Price" (Giá hợp lý nhất nên mua).
3. Rủi ro: Có model mới sắp ra mắt không? Có đợt sale lớn nào sắp tới không?
4. Lời khuyên: "BUY NOW", "WAIT", "SKIP".
5. Độ tin cậy (0-100%).

Trả về JSON THUẦN với cấu trúc:
{
  "trend": "Mô tả xu hướng",
  "suggestion": "Lời khuyên chi tiết",
  "adviceCode": "BUY_NOW | WAIT | SKIP",
  "risk": "Mô tả rủi ro",
  "fairPrice": 0,
  "reliability": 0,
  "chartData": [
    {"name": "Hiện tại", "price": 0},
    {"name": "30 ngày", "price": 0},
    {"name": "60 ngày", "price": 0},
    {"name": "90 ngày", "price": 0}
  ]
}
  `;

  try {
    const result = await generateContentWithFallback(prompt, {
      generationConfig: { responseMimeType: "application/json" },
    });
    const rawText = result.response.text();
    const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : cleaned);
  } catch (err) {
    console.error("Gemini AI Analysis Error:", err);
    return null;
  }
};

const predictPriceAdvanced = (price, discount, categoryName, productMeta = {}) => {
  const numericPrice = Number(price || 0);
  const numericDiscount = Number(discount || 0);
  const current = Math.round(numericPrice * (1 - numericDiscount / 100));
  const month = new Date().getMonth() + 1;

  let seasonalDrop = 0;
  if ([11, 12].includes(month)) seasonalDrop = 0.08;
  if ([6, 7].includes(month)) seasonalDrop = 0.05;

  const rate30 = 0.04 + seasonalDrop;
  const rate60 = 0.06 + seasonalDrop / 2;
  const rate90 = 0.09 + seasonalDrop / 3;

  const predicted30 = Math.round(current * (1 - rate30));
  const predicted60 = Math.round(current * (1 - rate60));
  const predicted90 = Math.round(current * (1 - rate90));

  let rawReliability = 70;
  if (numericDiscount > 0) rawReliability += 6;
  if (categoryName && String(categoryName).trim()) rawReliability += 5;
  if ([6, 7, 11, 12].includes(month)) rawReliability += 4;
  if (Number(productMeta.sold || 0) >= 10) rawReliability += 5;
  const reliability = Math.min(90, Math.max(65, rawReliability));

  return {
    currentPrice: current,
    predicted30,
    predicted60,
    predicted90,
    reliability,
  };
};

const getPricePrediction = async (productId) => {
  try {
    if (!productId) {
      return { errCode: 1, errMessage: "Thiếu productId", data: null };
    }

    const product = await db.Product.findByPk(productId, {
      include: [{ model: db.Category, as: "category" }],
    });

    if (!product) {
      return { errCode: 2, errMessage: "Sản phẩm không tìm thấy.", data: null };
    }

    const basicPredict = predictPriceAdvanced(
      product.basePrice || product.price,
      product.discount,
      product.category?.name,
      { sold: product.sold }
    );

    const rawAiAnalysis = await analyzeProductWithGemini(product);
    const discountRate = Number(product.discount || 0);
    const aiAnalysis = rawAiAnalysis
      ? {
          ...rawAiAnalysis,
          reliability:
            Number.isFinite(Number(rawAiAnalysis.reliability)) && Number(rawAiAnalysis.reliability) > 0
              ? Math.min(95, Math.max(50, Math.round(Number(rawAiAnalysis.reliability))))
              : basicPredict.reliability,
          isFallback: false,
          methodology: "gemini_market_analysis",
        }
      : null;

    const fallbackAiAnalysis = {
      trend:
        discountRate >= 10
          ? "Sản phẩm đang có mức ưu đãi tốt, giá có xu hướng ổn định trong ngắn hạn và giảm nhẹ theo chu kỳ sản phẩm."
          : "Giá dự kiến giảm dần 4% - 9% trong 30 đến 90 ngày tới theo chu kỳ thị trường công nghệ.",
      suggestion:
        discountRate >= 10
          ? "Mức giảm giá hiện tại khá hấp dẫn, phù hợp để mua ngay nếu bạn đang có nhu cầu sử dụng."
          : "Có thể cân nhắc chờ các đợt khuyến mãi lớn sắp tới nếu chưa cần gấp, hoặc mua ngay nếu cần phục vụ công việc.",
      adviceCode: discountRate >= 10 ? "BUY_NOW" : "WAIT",
      risk: "Biến động nguồn cung linh kiện hoặc đợt ra mắt phiên bản kế nhiệm có thể ảnh hưởng đến giá bán lẻ.",
      fairPrice: basicPredict.predicted30,
      reliability: basicPredict.reliability,
      isFallback: true,
      methodology: "deterministic_seasonal_heuristic",
      chartData: [
        { name: "Hiện tại", price: basicPredict.currentPrice },
        { name: "30 ngày", price: basicPredict.predicted30 },
        { name: "60 ngày", price: basicPredict.predicted60 },
        { name: "90 ngày", price: basicPredict.predicted90 },
      ],
    };

    return {
      errCode: 0,
      errMessage: "OK",
      data: {
        type: "price_prediction",
        productId: product.id,
        productName: product.name,
        category: product.category?.name || "Không xác định",
        ...basicPredict,
        aiAnalysis: aiAnalysis || fallbackAiAnalysis,
      }
    };
  } catch (error) {
    console.error("PricePredictorService Error:", error);
    return { errCode: -1, errMessage: "Lỗi hệ thống khi dự đoán giá.", data: null };
  }
};

module.exports = { getPricePrediction, predictPriceAdvanced };
