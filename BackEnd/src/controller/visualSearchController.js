const VisionAIService = require("../services/VisionAIService");

const handleVisualSearch = async (req, res) => {
  try {
    const { image } = req.body;
    const result = await VisionAIService.visualSearch(image);
    
    if (result.errCode !== 0) {
      return res.status(result.errCode === 1 ? 400 : 500).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("[VisualSearchController] Error:", error);
    res.status(500).json({ 
      errCode: -1, 
      errMessage: "Lỗi hệ thống khi tìm kiếm bằng hình ảnh." 
    });
  }
};

module.exports = { handleVisualSearch };
