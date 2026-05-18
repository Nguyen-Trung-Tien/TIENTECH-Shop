const db = require("../models");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.API_KEY);
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

const analyzeProductWithGemini = async (product) => {
  const currentMonth = new Date().getMonth() + 1;
  const prompt = `
Bạn là chuyên gia phân tích thị trường công nghệ. Hãy phân tích sản phẩm:
Tên: ${product.name}
Giá hiện tại: ${product.price}đ
Giảm giá: ${product.discount}%
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
    const result = await geminiModel.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (err) {
    console.error("Gemini AI Analysis Error:", err);
    return null;
  }
};

const predictPriceAdvanced = (price, discount, categoryName) => {
  const current = Math.round(price * (1 - discount / 100));
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

  const reliability = 70 + Math.floor(Math.random() * 20);

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
      product.category?.name
    );

    const aiAnalysis = await analyzeProductWithGemini(product);

    return {
      errCode: 0,
      errMessage: "OK",
      data: {
        type: "price_prediction",
        productId: product.id,
        productName: product.name,
        category: product.category?.name || "Không xác định",
        ...basicPredict,
        aiAnalysis: aiAnalysis || { error: "AI phân tích thất bại" },
      }
    };
  } catch (error) {
    console.error("PricePredictorService Error:", error);
    return { errCode: -1, errMessage: "Lỗi hệ thống khi dự đoán giá.", data: null };
  }
};

module.exports = { getPricePrediction };
