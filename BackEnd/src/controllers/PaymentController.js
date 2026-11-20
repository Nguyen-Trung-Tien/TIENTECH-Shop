const PaymentService = require("../services/order/PaymentService");
const { handleResponse, handleError } = require("../utils/controllerHelper");

const handleGetAllPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      method,
      search,
      startDate,
      endDate,
      orderBy = "createdAt",
      order = "DESC",
    } = req.query;

    const statusFilter = status === "all" ? null : status;
    const methodFilter = method === "all" ? null : method;

    const result = await PaymentService.getAllPayments({
      page: parseInt(page),
      limit: parseInt(limit),
      status: statusFilter,
      method: methodFilter,
      search: search?.trim() || "",
      startDate,
      endDate,
      orderBy,
      order: order.toUpperCase(),
    });

    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleGetAllPayments");
  }
};

const handleGetPaymentSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await PaymentService.getPaymentSummary(startDate, endDate);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleGetPaymentSummary");
  }
};

const handleGetPaymentById = async (req, res) => {
  try {
    const result = await PaymentService.getPaymentById(req.params.id);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleGetPaymentById");
  }
};

const handleCreatePayment = async (req, res) => {
  try {
    const result = await PaymentService.createPayment(req.body, req.user);
    return handleResponse(res, result, 201);
  } catch (e) {
    return handleError(res, e, "handleCreatePayment");
  }
};

const handleUpdatePayment = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const result = await PaymentService.updatePayment(orderId, req.body);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleUpdatePayment");
  }
};

const handleDeletePayment = async (req, res) => {
  try {
    const result = await PaymentService.deletePayment(req.params.id);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleDeletePayment");
  }
};

const handleCompletePayment = async (req, res) => {
  try {
    const result = await PaymentService.completePayment(
      req.params.id,
      req.body?.transactionId
    );
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleCompletePayment");
  }
};

const handleRefundPayment = async (req, res) => {
  try {
    const note = req.body?.note || req.body?.refundNote || "";
    const result = await PaymentService.refundPayment(req.params.id, note);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleRefundPayment");
  }
};

const handleCreatePaypalOrder = async (req, res) => {
  try {
    const result = await PaymentService.createPaypalCheckoutOrder(req.body, req.user);
    return handleResponse(res, result, 201);
  } catch (e) {
    return handleError(res, e, "handleCreatePaypalOrder");
  }
};

const handleCapturePaypalOrder = async (req, res) => {
  try {
    const { orderId, paypalOrderId } = req.body;
    const result = await PaymentService.capturePaypalCheckoutOrder(
      { orderId, paypalOrderId },
      req.user
    );
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleCapturePaypalOrder");
  }
};

module.exports = {
  handleGetAllPayments,
  handleGetPaymentSummary,
  handleGetPaymentById,
  handleCreatePayment,
  handleUpdatePayment,
  handleDeletePayment,
  handleCompletePayment,
  handleRefundPayment,
  handleCreatePaypalOrder,
  handleCapturePaypalOrder,
};
