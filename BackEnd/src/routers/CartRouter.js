const express = require("express");
const router = express.Router();
const CartController = require("../controller/CartController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

router.get(
  "/get-all-cart",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  CartController.getAllCarts
);
router.get(
  "/get-cart/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  CartController.getCartById
);
router.post(
  "/create-cart",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  CartController.createCart
);
router.put(
  "/update-cart/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  CartController.updateCart
);
router.delete(
  "/delete-cart/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  CartController.deleteCart
);

router.post(
  "/validate",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  CartController.handleValidateCart
);

module.exports = router;
