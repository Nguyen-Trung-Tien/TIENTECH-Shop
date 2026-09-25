const express = require("express");
const router = express.Router();
const OrderItemController = require("../controllers/OrderItemController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

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
  OrderItemController.handleCreateOrderItem
);
router.put(
  "/update-order-item/:id",
  authenticateToken,
  authorizeRole(["admin"]),
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
  OrderItemController.handleRequestReturn
);
router.put(
  "/request/:id/cancel-return",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  OrderItemController.handleCancelReturnRequest
);
router.put(
  "/process/:id/process-return",
  authenticateToken,
  authorizeRole(["admin"]),
  OrderItemController.handleProcessReturn
);

module.exports = router;
