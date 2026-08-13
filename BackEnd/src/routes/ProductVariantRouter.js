const express = require("express");
const router = express.Router();
const ProductVariantController = require("../controllers/ProductVariantController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

router.get(
  "/product/:productId",
  authenticateToken,
  authorizeRole(["admin"]),
  ProductVariantController.handleGetByProduct
);
router.post(
  "/create",
  authenticateToken,
  authorizeRole(["admin"]),
  ProductVariantController.handleCreate
);
router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  ProductVariantController.handleUpdate
);
router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  ProductVariantController.handleDelete
);

module.exports = router;
