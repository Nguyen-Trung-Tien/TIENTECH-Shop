const express = require("express");
const router = express.Router();
const OrderController = require("../controller/OrderController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

const { validate } = require("../middleware/zodMiddleware");
const { orderSchema } = require("../utils/zodSchemas");

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
  validate(orderSchema),
  OrderController.handleCreateOrder
);
router.put(
  "/update-status-order/:id/status",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
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
  OrderController.handleRequestReturn
);

router.post(
  "/return-action",
  authenticateToken,
  authorizeRole(["admin"]),
  OrderController.handleReturnAction
);

module.exports = router;
