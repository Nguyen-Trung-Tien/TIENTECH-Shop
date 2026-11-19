const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/OrderController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const { orderActionLimiter } = require("../middleware/rateLimiter");
const { idempotencyGuard } = require("../middleware/idempotencyMiddleware");

const { validate } = require("../middleware/zodMiddleware");
const {
  orderSchema,
  changePaymentMethodSchema,
  updateOrderStatusSchema,
  updateOrderPaymentStatusSchema,
  returnRequestSchema,
  returnActionSchema,
} = require("../utils/zodSchemas");

router.get(
  "/get-all-orders",
  authenticateToken,
  authorizeRole(["admin"]),
  OrderController.handleGetAllOrders
);
router.get(
  "/get-order/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  OrderController.handleGetOrderById
);
router.get(
  "/user/:userId",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  OrderController.handleGetOrdersByUserId
);
router.post(
  "/create-new-order",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  orderActionLimiter,
  idempotencyGuard(),
  validate(orderSchema),
  OrderController.handleCreateOrder
);
router.put(
  "/update-status-order/:id/status",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  validate(updateOrderStatusSchema),
  OrderController.handleUpdateOrderStatus
);
router.delete(
  "/delete-order/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  OrderController.handleDeleteOrder
);
router.put(
  "/update-payment-status/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(updateOrderPaymentStatusSchema),
  OrderController.handleUpdatePaymentStatus
);
router.get(
  "/active/:userId",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  OrderController.getActiveOrdersByUserId
);

router.post(
  "/return-request",
  authenticateToken,
  authorizeRole(["customer", "admin"]),
  orderActionLimiter,
  validate(returnRequestSchema),
  OrderController.handleRequestReturn
);

router.post(
  "/return-action",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(returnActionSchema),
  OrderController.handleReturnAction
);

router.put(
  ["/change-payment-method/:id", "/update-payment-method/:id"],
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  orderActionLimiter,
  validate(changePaymentMethodSchema),
  OrderController.handleChangePaymentMethod
);

module.exports = router;
