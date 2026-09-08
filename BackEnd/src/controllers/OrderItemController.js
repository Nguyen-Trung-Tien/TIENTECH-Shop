const OrderItemService = require("../services/order/OrderItemService");
const { handleResponse, handleError } = require("../utils/controllerHelper");

const handleGetAllOrderItems = async (req, res) => {
  try {
    const result = await OrderItemService.getAllOrderItems();
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleGetAllOrderItems");
  }
};

const handleGetOrderItemById = async (req, res) => {
  try {
    const result = await OrderItemService.getOrderItemById(req.params.id);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleGetOrderItemById");
  }
};

const handleCreateOrderItem = async (req, res) => {
  try {
    const result = await OrderItemService.createOrderItem(req.body);
    return handleResponse(res, result, 201);
  } catch (e) {
    return handleError(res, e, "handleCreateOrderItem");
  }
};

const handleUpdateOrderItem = async (req, res) => {
  try {
    const result = await OrderItemService.updateOrderItem(
      req.params.id,
      req.body
    );
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleUpdateOrderItem");
  }
};

const handleDeleteOrderItem = async (req, res) => {
  try {
    const result = await OrderItemService.deleteOrderItem(req.params.id);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleDeleteOrderItem");
  }
};

const handleRequestReturn = async (req, res) => {
  try {
    const result = await OrderItemService.requestReturn(
      req.params.id,
      req.body.reason,
      req.user
    );
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleRequestReturn");
  }
};

const handleCancelReturnRequest = async (req, res) => {
  try {
    const result = await OrderItemService.cancelReturnRequest(req.params.id, req.user);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleCancelReturnRequest");
  }
};

const handleProcessReturn = async (req, res) => {
  try {
    const statusOrAction = req.body.status || req.body.action;
    const result = await OrderItemService.processReturn(
      req.params.id,
      statusOrAction,
      req.user
    );
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleProcessReturn");
  }
};

module.exports = {
  handleGetAllOrderItems,
  handleGetOrderItemById,
  handleCreateOrderItem,
  handleUpdateOrderItem,
  handleDeleteOrderItem,
  handleRequestReturn,
  handleCancelReturnRequest,
  handleProcessReturn,
};
