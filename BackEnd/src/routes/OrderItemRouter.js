const express = require("express");
const router = express.Router();
const OrderItemController = require("../controllers/OrderItemController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const { validate } = require("../middleware/zodMiddleware");
const {
  createOrderItemSchema,
  updateOrderItemSchema,
  orderItemReturnRequestSchema,
  idParamSchema,
  orderItemProcessReturnSchema,
} = require("../utils/zodSchemas");

router.get(
  "/get-order-item",
  authenticateToken,
  authorizeRole(["admin"]),
  OrderItemController.handleGetAllOrderItems
);
router.get(
  "/order-item/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  OrderItemController.handleGetOrderItemById
);
router.post(
  "/create-new-order-item",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(createOrderItemSchema),
  OrderItemController.handleCreateOrderItem
);
router.put(
  "/update-order-item/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(updateOrderItemSchema),
  OrderItemController.handleUpdateOrderItem
);
router.delete(
  "/delete-order-item/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  OrderItemController.handleDeleteOrderItem
);

router.put(
  "/request/:id/request-return",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  validate(orderItemReturnRequestSchema),
  OrderItemController.handleRequestReturn
);
router.put(
  "/request/:id/cancel-return",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  validate(idParamSchema),
  OrderItemController.handleCancelReturnRequest
);
router.put(
  "/process/:id/process-return",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(orderItemProcessReturnSchema),
  OrderItemController.handleProcessReturn
);

module.exports = router;
