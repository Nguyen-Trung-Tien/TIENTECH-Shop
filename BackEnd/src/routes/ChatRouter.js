const express = require("express");
const router = express.Router();
const ChatController = require("../controllers/chatController");
const PricePredictorController = require("../controllers/pricePredictorController");
const FengShuiChatController = require("../controllers/fengShuiChatController");
const VisualSearchController = require("../controllers/visualSearchController");
const { aiApiLimiter } = require("../middleware/rateLimiter");
const { optionalAuthenticateToken } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/zodMiddleware");
const {
  chatAskSchema,
  chatVisualSearchSchema,
  chatPredictSchema,
  chatFengShuiSchema,
} = require("../utils/zodSchemas");

router.post(
  "/ask",
  optionalAuthenticateToken,
  aiApiLimiter,
  validate(chatAskSchema),
  ChatController.handleChat
);
router.post(
  "/visual-search",
  aiApiLimiter,
  validate(chatVisualSearchSchema),
  VisualSearchController.handleVisualSearch
);
router.post(
  "/predict",
  aiApiLimiter,
  validate(chatPredictSchema),
  PricePredictorController.handlePricePredict
);

router.get("/fengshui-detail", FengShuiChatController.handleGetFengShuiDetail);
router.post(
  "/fengshui",
  aiApiLimiter,
  validate(chatFengShuiSchema),
  FengShuiChatController.handleFengShuiChat
);

module.exports = router;
