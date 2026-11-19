const ContactService = require("../services/common/ContactService");
const { handleResponse, handleError } = require("../utils/controllerHelper");

const handleSubmitContact = async (req, res) => {
  try {
    const io = typeof req.app?.get === "function" ? req.app.get("io") : null;
    const result = await ContactService.createTicket(req.body, io);
    return handleResponse(res, result);
  } catch (error) {
    return handleError(res, error, "handleSubmitContact");
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
    const result = await ContactService.updateTicket(
      req.params.id,
      req.body,
      req.user,
    );
    return handleResponse(res, result);
  } catch (error) {
    return handleError(res, error, "handleUpdateTicket");
  }
};

module.exports = {
  handleSubmitContact,
  handleGetAllTickets,
  handleUpdateTicket,
};
