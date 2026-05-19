const PaymentService = require("../services/PaymentService");

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

    return res.status(200).json(result);
  } catch (e) {
    console.error("handleGetAllPayments error:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetPaymentSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await PaymentService.getPaymentSummary(startDate, endDate);
    return res.status(200).json(result);
  } catch (e) {
    console.error("handleGetPaymentSummary error:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetPaymentById = async (req, res) => {
  try {
    const result = await PaymentService.getPaymentById(req.params.id);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleCreatePayment = async (req, res) => {
  try {
    const result = await PaymentService.createPayment(req.body, req.user);
    return res.status(result.status || 201).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleUpdatePayment = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const result = await PaymentService.updatePayment(orderId, req.body);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleDeletePayment = async (req, res) => {
  try {
    const result = await PaymentService.deletePayment(req.params.id);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleCompletePayment = async (req, res) => {
  try {
    const result = await PaymentService.completePayment(
      req.params.id,
      req.body?.transactionId
    );
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleRefundPayment = async (req, res) => {
  try {
    const note = req.body?.note || "";
    const result = await PaymentService.refundPayment(req.params.id, note);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
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
};
