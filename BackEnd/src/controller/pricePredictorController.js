const PricePredictorService = require("../services/PricePredictorService");

const handlePricePredict = async (req, res) => {
  try {
    const { productId } = req.body;
    const result = await PricePredictorService.getPricePrediction(productId);
    
    if (result.errCode !== 0) {
      return res.status(result.errCode === 1 || result.errCode === 2 ? 400 : 500).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("[PricePredictorController] Error:", err);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Lỗi hệ thống khi dự đoán giá tương lai.",
    });
  }
};

module.exports = { handlePricePredict };
