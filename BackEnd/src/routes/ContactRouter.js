const express = require("express");
const router = express.Router();
const ContactController = require("../controllers/ContactController");
const { validate } = require("../middleware/zodMiddleware");
const { contactSchema } = require("../utils/zodSchemas");
const { sensitiveActionLimiter } = require("../middleware/rateLimiter");

router.post(
  "/",
  sensitiveActionLimiter,
  validate(contactSchema),
  ContactController.handleSubmitContact,
);

module.exports = router;
