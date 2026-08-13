const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chatController");
const PricePredictorController = require("../controllers/pricePredictorController");
const FengShuiChatController = require("../controllers/fengShuiChatController");
const VisualSearchController = require("../controllers/visualSearchController");
const { aiApiLimiter } = require("../middleware/rateLimiter");

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

const validatePredictRequest = (req, res, next) => {
  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: "Bạn phải gửi kèm 'productId'." });
  }
  next();
};

router.post("/ask", aiApiLimiter, validateChatRequest, ChatController.handleChat);
router.post("/visual-search", aiApiLimiter, VisualSearchController.handleVisualSearch);
router.post(
  "/predict",
  aiApiLimiter,
  validatePredictRequest,
  PricePredictorController.handlePricePredict
);

router.post(
  "/fengshui",
  aiApiLimiter,
  validateChatRequest,
  FengShuiChatController.handleFengShuiChat
);

module.exports = router;
