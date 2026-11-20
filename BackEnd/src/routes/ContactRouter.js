const express = require("express");
const router = express.Router();
const ContactController = require("../controllers/ContactController");
const {
  authenticateToken,
  authorizeRole,
  optionalAuthenticateToken,
} = require("../middleware/authMiddleware");
const { validate } = require("../middleware/zodMiddleware");
const {
  contactSchema,
  updateContactTicketSchema,
  bulkDeleteTicketsSchema,
  updateUserTicketSchema,
  idParamSchema,
} = require("../utils/zodSchemas");
const { sensitiveActionLimiter } = require("../middleware/rateLimiter");

router.post(
  "/",
  sensitiveActionLimiter,
  optionalAuthenticateToken,
  validate(contactSchema),
  ContactController.handleSubmitContact,
);

router.get(
  "/my-tickets",
  authenticateToken,
  ContactController.handleGetMyTickets,
);

router.patch(
  "/my-tickets/:id",
  authenticateToken,
  validate(updateUserTicketSchema),
  ContactController.handleUpdateUserTicket,
);

router.delete(
  "/my-tickets/:id",
  authenticateToken,
  validate(idParamSchema),
  ContactController.handleDeleteUserTicket,
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

router.delete(
  "/admin/tickets/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(idParamSchema),
  ContactController.handleDeleteTicket,
);

router.post(
  "/admin/tickets/bulk-delete",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(bulkDeleteTicketsSchema),
  ContactController.handleBulkDeleteTickets,
);

module.exports = router;
