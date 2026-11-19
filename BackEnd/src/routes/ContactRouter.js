const express = require("express");
const router = express.Router();
const ContactController = require("../controllers/ContactController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/zodMiddleware");
const {
  contactSchema,
  updateContactTicketSchema,
} = require("../utils/zodSchemas");
const { sensitiveActionLimiter } = require("../middleware/rateLimiter");

router.post(
  "/",
  sensitiveActionLimiter,
  validate(contactSchema),
  ContactController.handleSubmitContact,
);

router.get(
  "/admin/tickets",
  authenticateToken,
  authorizeRole(["admin"]),
  ContactController.handleGetAllTickets,
);

router.patch(
  "/admin/tickets/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(updateContactTicketSchema),
  ContactController.handleUpdateTicket,
);

module.exports = router;
