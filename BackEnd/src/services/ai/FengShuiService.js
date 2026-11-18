const db = require("../../models");
const { Op } = require("sequelize");
const { getFengShuiDetail } = require("../../utils/fortuneUtils");
const { generateContentWithFallback } = require("../../config/gemini");

const extractJson = (text) => {
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
};

const getFengShuiAdvice = async (data) => {
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
    } = data;

    const fs = getFengShuiDetail(Number(birthYear), gender);
    const allLuckyColors = [...fs.luckyColors, ...fs.supportColors];

    let products = [];
    try {
      products = await db.Product.findAll({
        where: {
          isActive: true,
          [Op.or]: allLuckyColors.map((color) => ({
            specifications: { [Op.like]: `%${color}%` },
          })),
          ...(brandId && { brandId }),
          ...(categoryId && { categoryId }),
          ...(minPrice && { basePrice: { [Op.gte]: minPrice } }),
          ...(maxPrice && { basePrice: { [Op.lte]: maxPrice } }),
        },
        attributes: { exclude: ["embedding"] },
        include: [
          { model: db.Brand, as: "brand" },
          { model: db.Category, as: "category" },
          {
            model: db.ProductImage,
            as: "images",
            attributes: ["imageUrl", "isPrimary"],
            required: false,
          },
        ],
        order: [
          ["sold", "DESC"],
          ["discount", "DESC"],
        ],
        limit: 6,
      });
    } catch (dbError) {
      console.error("Lỗi DB FengShui Products:", dbError);
    }

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
        const currentPrice = (p.basePrice || 0) * (1 - (p.discount || 0) / 100);
        dbContext += `- ID: ${p.id}, Tên: ${p.name}, Giá: ${currentPrice.toLocaleString()}đ\n`;
      });
    }

    const systemPrompt = `
Bạn là "TienTech AI Tech Color & Setup Advisor" - Chuyên gia tư vấn màu sắc thiết bị công nghệ và thiết kế góc Setup hợp mệnh/cá tính.
Nhiệm vụ: Tư vấn chọn sản phẩm công nghệ (Laptop, Smartphone, Tablet, Phụ kiện...) dựa trên bảng màu ngũ hành và phong cách cá nhân.

NGUYÊN TẮC TƯ VẤN:
1. Chào hỏi chuyên nghiệp, hiện đại (VD: "Chào bạn sinh năm ${birthYear}...").
2. Phân tích sự hòa hợp giữa bản mệnh (${fs.cungPhi} - Hành ${fs.element}) với màu sắc thiết bị và phong cách bàn làm việc (Setup).
3. Ưu tiên gợi ý bảng màu Tương sinh (${fs.supportColors.join(", ")}) trước, sau đó đến màu Bản mệnh (${fs.luckyColors.join(", ")}). Khuyên tránh bảng màu tương khắc (${fs.badColors.join(", ")}).
4. Gợi ý các con số phù hợp (${fs.luckyNumbers.join(", ")}) cho cấu hình hoặc mã sản phẩm.
5. Tư vấn thêm về hướng bố trí góc Setup / thiết bị trên bàn làm việc để tối ưu cảm hứng và năng suất.
6. Dựa vào danh sách sản phẩm trong kho bên dưới, hãy đề xuất ID tương ứng trong recommendedProducts.
7. Trả về JSON THUẦN:
{
  "reply": "Lời tư vấn chi tiết, súc tích và hiện đại",
  "recommendedProducts": [id1, id2, id3],
  "fsData": ${JSON.stringify(fs)}
}

DANH SÁCH SẢN PHẨM PHÙ HỢP TRONG CỬA HÀNG:
${dbContext || "Không có sản phẩm nào phù hợp trực tiếp trong kho."}
`;

    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      ...history.slice(-6).map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [
          {
            text:
              typeof msg.content === "string"
                ? msg.content
                : JSON.stringify(msg.content),
          },
        ],
      })),
      { role: "user", parts: [{ text: message }] },
    ];

    let result = {};
    try {
      const resultGen = await generateContentWithFallback(
        { contents },
        { generationConfig: { responseMimeType: "application/json" } },
      );
      const responseText = resultGen.response.text();
      result = extractJson(responseText);
    } catch (aiError) {
      console.error(
        "FengShuiService AI Error (using deterministic fallback):",
        aiError.message || aiError,
      );
      const fallbackReply = [
        `Kính chào quý khách sinh năm ${birthYear} (${fs.gender}) — Mệnh Niên ${fs.menhNien}, Cung Phi ${fs.cungPhi} (Hành ${fs.element}).`,
        `Màu Đại Cát (Tương sinh): ${fs.supportColors.join(", ")}.`,
        `Màu Bình An (Bản mệnh): ${fs.luckyColors.join(", ")}.`,
        `Nên hạn chế màu: ${fs.badColors.join(", ")}.`,
        `Con số may mắn: ${fs.luckyNumbers.join(", ")}.`,
        fs.advice,
        fs.workspaceTip,
      ].join(" ");
      result = {
        reply: fallbackReply,
        recommendedProducts: products.slice(0, 3).map((p) => p.id),
      };
    }

    const mapProductWithImage = (p) => {
      const plain = typeof p.toJSON === "function" ? p.toJSON() : { ...p };
      const primaryImg =
        plain.images?.find((img) => img.isPrimary)?.imageUrl ||
        plain.images?.[0]?.imageUrl ||
        null;
      return {
        ...plain,
        image: primaryImg,
      };
    };

    let finalRecommended = [];
    if (
      Array.isArray(result.recommendedProducts) &&
      result.recommendedProducts.length > 0
    ) {
      try {
        const dbRecommended = await db.Product.findAll({
          where: {
            id: { [Op.in]: result.recommendedProducts },
            isActive: true,
          },
          attributes: ["id", "name", "slug", "basePrice", "discount"],
          include: [
            {
              model: db.ProductImage,
              as: "images",
              attributes: ["imageUrl", "isPrimary"],
              required: false,
            },
          ],
        });
        finalRecommended = dbRecommended.map(mapProductWithImage);
      } catch (dbError2) {
        console.error("Lỗi DB Recommended Products:", dbError2);
      }
    }

    const fallbackProducts = products.slice(0, 3).map(mapProductWithImage);

    return {
      errCode: 0,
      errMessage: "OK",
      data: {
        reply:
          result.reply ||
          "Tôi đã xem quẻ cho bạn nhưng gặp chút khó khăn khi diễn đạt. Bạn hãy thử lại nhé!",
        recommendedProducts:
          finalRecommended.length > 0 ? finalRecommended : fallbackProducts,
      },
    };
  } catch (error) {
    console.error("FengShuiService Error:", error);
    return {
      errCode: -1,
      errMessage: "Lỗi hệ thống khi tư vấn phong thủy.",
      data: null,
    };
  }
};

module.exports = {
  getFengShuiAdvice,
};
