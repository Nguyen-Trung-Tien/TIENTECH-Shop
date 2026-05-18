const OrderItemService = require("../services/OrderItemService");

const handleGetAllOrderItems = async (req, res) => {
  try {
    const result = await OrderItemService.getAllOrderItems();
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetOrderItemById = async (req, res) => {
  try {
    const result = await OrderItemService.getOrderItemById(req.params.id);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleCreateOrderItem = async (req, res) => {
  try {
    const result = await OrderItemService.createOrderItem(req.body);
    return res.status(201).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleUpdateOrderItem = async (req, res) => {
  try {
    const result = await OrderItemService.updateOrderItem(
      req.params.id,
      req.body
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

const handleDeleteOrderItem = async (req, res) => {
  try {
    const result = await OrderItemService.deleteOrderItem(req.params.id);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleRequestReturn = async (req, res) => {
  try {
    const result = await OrderItemService.requestReturn(
      req.params.id,
      req.body.reason
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

const handleProcessReturn = async (req, res) => {
  try {
    const result = await OrderItemService.processReturn(
      req.params.id,
      req.body.status,
      req.user
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

module.exports = {
  handleGetAllOrderItems,
  handleGetOrderItemById,
  handleCreateOrderItem,
  handleUpdateOrderItem,
  handleDeleteOrderItem,
  handleRequestReturn,
  handleProcessReturn,
};
