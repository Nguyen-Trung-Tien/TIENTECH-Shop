const express = require("express");
const router = express.Router();
const CartController = require("../controllers/CartController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const { validate } = require("../middleware/zodMiddleware");
const { createCartSchema, updateCartSchema, validateCartSchema } = require("../utils/zodSchemas");

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
  validate(createCartSchema),
  CartController.createCart
);
router.put(
  "/update-cart/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  validate(updateCartSchema),
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
  validate(validateCartSchema),
  CartController.handleValidateCart
);

module.exports = router;
