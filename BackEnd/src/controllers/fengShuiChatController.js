const FengShuiService = require("../services/ai/FengShuiService");
const { getFengShuiDetail, getAllElementsMetadata } = require("../utils/fortuneUtils");

const handleGetFengShuiDetail = async (req, res) => {
  try {
    const rawYear = req.query.birthYear || req.query.year || 1998;
    const year = parseInt(rawYear, 10) || 1998;
    const gender = req.query.gender || "male";

    const detail = getFengShuiDetail(year, gender);
    const elements = getAllElementsMetadata();

    return res.status(200).json({
      errCode: 0,
      errMessage: "OK",
      data: {
        ...detail,
        elements,
      },
    });
  } catch (error) {
    console.error("[FengShuiController] Lỗi tra cứu phong thủy:", error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi hệ thống khi tra cứu phong thủy.",
    });
  }
};

const handleFengShuiChat = async (req, res) => {
  try {
    const { birthYear, message } = req.body;

    if (!birthYear || !message) {
      return res.status(400).json({ 
        errCode: 1, 
        errMessage: "Thiếu năm sinh hoặc câu hỏi." 
      });
    }

    const result = await FengShuiService.getFengShuiAdvice(req.body);
    
    return res.status(result.errCode === 0 ? 200 : 500).json(result);
  } catch (error) {
    console.error("[FengShuiController] Lỗi chatbot phong thủy:", error);
    res.status(500).json({ 
      errCode: -1, 
      errMessage: "Lỗi xử lý AI phong thủy." 
    });
  }
};

module.exports = {
  handleGetFengShuiDetail,
  handleFengShuiChat,
};
