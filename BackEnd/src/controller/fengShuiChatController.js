require("dotenv").config();
const OpenAI = require("openai");
const { Product, Brand, Category } = require("../models");
const { Op } = require("sequelize");
const { getFengShuiDetail } = require("../utils/fortuneUtils");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const handleFengShuiChat = async (req, res) => {
  try {
    const {
      birthYear,
      gender = "male",
      message,
      brandId,
      categoryId,
      minPrice,
      maxPrice,
      history = [],
    } = req.body;

    if (!birthYear || !message)
      return res.status(400).json({ error: "Thiếu năm sinh hoặc câu hỏi." });

    const fs = getFengShuiDetail(Number(birthYear), gender);
    const allLuckyColors = [...fs.luckyColors, ...fs.supportColors];

    const products = await Product.findAll({
      where: {
        isActive: true,
        [Op.or]: allLuckyColors.map((color) => ({
          color: { [Op.like]: `%${color}%` },
        })),
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
      ],
      limit: 6,
    });

    let dbContext = `
THÔNG TIN KHÁCH HÀNG:
- Năm sinh: ${birthYear} (${fs.gender})
- Mệnh Niên: ${fs.menhNien}
- Cung Phi: ${fs.cungPhi} (Hành ${fs.element})
- Màu Đại Cát (Tương sinh): ${fs.supportColors.join(", ")}
- Màu Bình An (Bản mệnh): ${fs.luckyColors.join(", ")}
- Màu Đại Kỵ: ${fs.badColors.join(", ")}
- Con số may mắn: ${fs.luckyNumbers.join(", ")}
`;

    if (products.length) {
      dbContext += "\nSẢN PHẨM HỢP MỆNH TRONG KHO:\n";
      products.forEach((p) => {
        const currentPrice = p.price * (1 - p.discount / 100);
        dbContext += `- ID: ${p.id}, Tên: ${p.name}, Màu: ${p.color}, Giá: ${currentPrice.toLocaleString()}đ\n`;
      });
    }

    const systemPrompt = `
Bạn là "TienTech FengShui Master" - Bậc thầy phong thủy công nghệ.
Nhiệm vụ: Tư vấn chọn sản phẩm (Laptop, iPhone, Tablet...) dựa trên bản mệnh chuyên sâu.

NGUYÊN TẮC TƯ VẤN:
1. Chào hỏi theo phong cách chuyên gia (VD: "Kính thưa quý khách sinh năm ${birthYear}...").
2. Phân tích sự kết hợp giữa cung phi ${fs.cungPhi} và sản phẩm người dùng đang quan tâm.
3. Ưu tiên gợi ý màu sắc Đại Cát trước, sau đó mới đến màu Bình An. Tuyệt đối khuyên tránh màu Đại Kỵ.
4. Nhắc đến các con số may mắn (${fs.luckyNumbers.join(", ")}) có thể xuất hiện trong giá tiền hoặc mã máy.
5. Tư vấn thêm về hướng đặt thiết bị trên bàn làm việc để kích tài lộc (Ví dụ: Mệnh ${fs.element} đặt hướng nào).
6. Trả về JSON THUẦN:
{
  "reply": "Lời tư vấn tâm huyết và chi tiết",
  "recommendedProducts": [id1, id2, id3],
  "fsData": ${JSON.stringify(fs)}
}
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6).map((msg) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content:
          typeof msg.content === "string"
            ? msg.content
            : JSON.stringify(msg.content),
      })),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Lấy thông tin chi tiết của các sản phẩm được đề xuất
    let finalRecommended = [];
    if (result.recommendedProducts && result.recommendedProducts.length > 0) {
      finalRecommended = await Product.findAll({
        where: { id: { [Op.in]: result.recommendedProducts }, isActive: true },
        attributes: ["id", "name", "price", "discount", "image"],
      });
    }

    res.json({
      reply: result.reply,
      recommendedProducts: finalRecommended,
    });
  } catch (error) {
    console.error("Lỗi chatbot phong thủy:", error);
    res.status(500).json({ error: "Lỗi xử lý AI phong thủy." });
  }
};

module.exports = { handleFengShuiChat };
