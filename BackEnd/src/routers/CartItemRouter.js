const express = require("express");
const router = express.Router();
const CartItemController = require("../controller/CartItemController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

const { validate } = require("../middleware/zodMiddleware");
const { cartItemSchema, updateCartItemSchema } = require("../utils/zodSchemas");

router.get(
  "/get-all-cartItem",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  CartItemController.getAllCartItems
);
router.get(
  "/get-cartItem/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  CartItemController.getCartItemById
);
router.post(
  "/create-cartItem/",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  validate(cartItemSchema),
  CartItemController.createCartItem
);
router.put(
  "/update-cartItem/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  validate(updateCartItemSchema),
  CartItemController.updateCartItem
);
router.delete(
  "/delete-cartItem/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  CartItemController.deleteCartItem
);

module.exports = router;
