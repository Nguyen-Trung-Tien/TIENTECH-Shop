/**
 * OrderService - Facade aggregating modular Order Use-Cases
 */
const {
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  getActiveOrdersByUserId,
  getOrderByCode,
  trackOrderPublic,
} = require("./use-cases/OrderQueryUseCase");

const { createOrder } = require("./use-cases/OrderCreationUseCase");

const {
  updateOrderStatus,
  deleteOrder,
  updatePaymentStatus,
  changePaymentMethod,
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
  changePaymentMethod,
  getOrdersByUserId,
  getActiveOrdersByUserId,
  getOrderByCode,
  trackOrderPublic,
  syncOrderCancellationSideEffects,
  requestReturn,
  handleReturnAction,
  VALID_ADMIN_TRANSITIONS,
};
