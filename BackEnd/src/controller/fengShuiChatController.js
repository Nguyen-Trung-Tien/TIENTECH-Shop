const FengShuiService = require("../services/FengShuiService");

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

module.exports = { handleFengShuiChat };
