const express = require("express");
const router = express.Router();
const ChatController = require("../controller/chatController");
const PricePredictorController = require("../controller/pricePredictorController");
const FengShuiChatController = require("../controller/fengShuiChatController");
const VisualSearchController = require("../controller/visualSearchController");

// Validate chat message
const validateChatRequest = (req, res, next) => {
  const { message } = req.body;
  if (!message || typeof message !== "string") {
    return res
      .status(400)
      .json({ error: "Bạn phải gửi kèm 'message' dạng text." });
  }
  if (message.length > 500) {
    return res
      .status(400)
      .json({ error: "Tin nhắn quá dài, vui lòng rút gọn." });
  }
  next();
};

// Validate productId cho predict
const validatePredictRequest = (req, res, next) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: "Bạn phải gửi kèm 'productId'." });
  }
  next();
};

router.post("/ask", validateChatRequest, ChatController.handleChat);
router.post("/visual-search", VisualSearchController.handleVisualSearch);
router.post(
  "/predict",
  validatePredictRequest,
  PricePredictorController.handlePricePredict
);

router.post(
  "/fengshui",
  validateChatRequest,
  FengShuiChatController.handleFengShuiChat
);

module.exports = router;
