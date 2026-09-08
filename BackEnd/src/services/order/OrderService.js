/**
 * OrderService - Facade aggregating modular Order Use-Cases
 */
const {
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  getActiveOrdersByUserId,
  getOrderByCode,
} = require("./use-cases/OrderQueryUseCase");

const { createOrder } = require("./use-cases/OrderCreationUseCase");

const {
  updateOrderStatus,
  deleteOrder,
  updatePaymentStatus,
  syncOrderCancellationSideEffects,
  VALID_ADMIN_TRANSITIONS,
} = require("./use-cases/OrderStatusUseCase");

const {
  requestReturn,
  handleReturnAction,
} = require("./use-cases/OrderReturnUseCase");

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  updatePaymentStatus,
  getOrdersByUserId,
  getActiveOrdersByUserId,
  getOrderByCode,
  syncOrderCancellationSideEffects,
  requestReturn,
  handleReturnAction,
  VALID_ADMIN_TRANSITIONS,
};
