require("dotenv").config();
const { Product, Category } = require("../models");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" },
});

async function analyzeProductWithGemini(product) {
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
}

function predictPriceAdvanced(price, discount, categoryName) {
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
}

const handlePricePredict = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: "Thiếu productId" });

    const product = await Product.findByPk(productId, {
      include: [{ model: Category, as: "category" }],
    });

    if (!product)
      return res.status(404).json({ error: "Sản phẩm không tìm thấy." });

    const basicPredict = predictPriceAdvanced(
      product.price,
      product.discount,
      product.category?.name
    );

    const aiAnalysis = await analyzeProductWithGemini(product);

    return res.json({
      type: "price_prediction",
      productId: product.id,
      productName: product.name,
      category: product.category?.name || "Không xác định",
      ...basicPredict,
      aiAnalysis: aiAnalysis || { error: "AI phân tích thất bại" },
    });
  } catch (err) {
    console.error("Lỗi Price Predictor:", err);
    return res.status(500).json({
      error: "Lỗi khi dự đoán giá tương lai.",
    });
  }
};

module.exports = { handlePricePredict };
