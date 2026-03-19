require("dotenv").config();
const OpenAI = require("openai");
const { Product, Brand, Category } = require("../models");
const { Op } = require("sequelize");
const {
  getElementByBirthYear,
  getLuckyColorsByYear,
} = require("../utils/fortuneUtils");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const handleFengShuiChat = async (req, res) => {
  try {
    const { birthYear, message, brandId, categoryId, minPrice, maxPrice, history = [] } =
      req.body;

    if (!birthYear || !message)
      return res.status(400).json({ error: "Thiếu năm sinh hoặc câu hỏi." });

    const element = getElementByBirthYear(Number(birthYear));
    const luckyColors = getLuckyColorsByYear(Number(birthYear));

    const products = await Product.findAll({
      where: {
        isActive: true,
        color: { [Op.in]: luckyColors },
        ...(brandId && { brandId }),
        ...(categoryId && { categoryId }),
        ...(minPrice && { price: { [Op.gte]: minPrice } }),
        ...(maxPrice && { price: { [Op.lte]: maxPrice } }),
      },
      include: [
        { model: Brand, as: "brand" },
        { model: Category, as: "category" },
      ],
      order: [
        ["sold", "DESC"],
        ["discount", "DESC"],
        ["createdAt", "DESC"],
      ],
      limit: 6,
    });

    let dbContext = `Mệnh: ${element}\nMàu may mắn: ${luckyColors.join(", ")}`;
    if (products.length) {
      dbContext += "\nSản phẩm gợi ý trong kho:\n";
      products.forEach((p) => {
        const currentPrice = p.price * (1 - p.discount / 100);
        dbContext += `- ID: ${p.id}, Tên: ${p.name}, Giá: ${currentPrice.toLocaleString()} ₫, Kho: ${p.stock}\n`;
      });
    }

    const systemPrompt = `
Bạn là chuyên gia phong thủy của TienTech Shop.
Nhiệm vụ: Tư vấn chọn sản phẩm công nghệ theo bản mệnh, màu sắc may mắn của khách hàng.

THÔNG TIN PHONG THỦY & KHO:
${dbContext}

YÊU CẦU PHẢN HỒI:
1. Trả lời bằng tiếng Việt, giọng điệu chuyên gia nhưng gần gũi.
2. Giải thích tại sao sản phẩm/màu sắc đó lại hợp với mệnh ${element}.
3. Trả về định dạng JSON THUẦN:
{
  "reply": "Nội dung tư vấn của bạn",
  "recommendedProducts": [id1, id2] // Mảng ID các sản phẩm hợp mệnh nhất (tối đa 3)
}
4. Không markdown, không giải thích ngoài JSON.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6).map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      })),
      { role: "user", content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

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
    console.error("Lỗi chatbot phong thủy:", error);
    res.status(500).json({ error: "Lỗi xử lý AI phong thủy." });
  }
};

module.exports = { handleFengShuiChat };
