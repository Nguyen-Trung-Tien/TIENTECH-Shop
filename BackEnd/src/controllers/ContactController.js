const ContactService = require("../services/common/ContactService");
const { handleResponse, handleError } = require("../utils/controllerHelper");

const handleSubmitContact = async (req, res) => {
  try {
    const io = typeof req.app?.get === "function" ? req.app.get("io") : null;
    const payload = {
      ...req.body,
      name: (req.body?.name || req.user?.username || req.user?.name || "Khách hàng").trim(),
      email: (req.body?.email || req.user?.email || "").trim(),
      userId: req.user?.id || req.body?.userId || null,
    };
    if (!payload.email) {
      return handleResponse(res, {
        errCode: 400,
        errMessage: "Vui lòng cung cấp email liên hệ hợp lệ.",
      });
    }
    const result = await ContactService.createTicket(payload, io);
    return handleResponse(res, result);
  } catch (error) {
    return handleError(res, error, "handleSubmitContact");
  }
};

const handleGetMyTickets = async (req, res) => {
  try {
    const result = await ContactService.getUserTickets(req.user.id, req.query);
    return handleResponse(res, result);
  } catch (error) {
    return handleError(res, error, "handleGetMyTickets");
  }
};

const handleGetAllTickets = async (req, res) => {
  try {
    const result = await ContactService.getAllTickets(req.query);
    return handleResponse(res, result);
  } catch (error) {
    return handleError(res, error, "handleGetAllTickets");
  }
};

const handleUpdateTicket = async (req, res) => {
  try {
    const io = req.app.get("io");
    const result = await ContactService.updateTicket(
      req.params.id,
      req.body,
      req.user,
      io,
    );
    return handleResponse(res, result);
  } catch (error) {
    return handleError(res, error, "handleUpdateTicket");
  }
};

const handleDeleteTicket = async (req, res) => {
  try {
    const result = await ContactService.deleteTicket(req.params.id);
    return handleResponse(res, result);
  } catch (error) {
    return handleError(res, error, "handleDeleteTicket");
  }
};

const handleBulkDeleteTickets = async (req, res) => {
  try {
    const result = await ContactService.bulkDeleteTickets(req.body.ids);
    return handleResponse(res, result);
  } catch (error) {
    return handleError(res, error, "handleBulkDeleteTickets");
  }
};

const handleUpdateUserTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const ticketId = req.params.id;
    const result = await ContactService.updateUserTicket(userId, ticketId, req.body);
    return handleResponse(res, result);
  } catch (error) {
    return handleError(res, error, "handleUpdateUserTicket");
  }
};

const handleDeleteUserTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const ticketId = req.params.id;
    const result = await ContactService.deleteUserTicket(userId, ticketId);
    return handleResponse(res, result);
  } catch (error) {
    return handleError(res, error, "handleDeleteUserTicket");
  }
};

module.exports = {
  handleSubmitContact,
  handleGetMyTickets,
  handleGetAllTickets,
  handleUpdateTicket,
  handleDeleteTicket,
  handleBulkDeleteTickets,
  handleUpdateUserTicket,
  handleDeleteUserTicket,
};
