const express = require("express");
const router = express.Router();
const ProductVariantController = require("../controllers/ProductVariantController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const { validate } = require("../middleware/zodMiddleware");
const { variantCreateSchema, variantUpdateSchema } = require("../utils/zodSchemas");

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
  validate(variantCreateSchema),
  ProductVariantController.handleCreate
);
router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  validate(variantUpdateSchema),
  ProductVariantController.handleUpdate
);
router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  ProductVariantController.handleDelete
);

module.exports = router;
