const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/CategoryController");
const upload = require("./multer");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const { validate } = require("../middleware/zodMiddleware");
const { categoryCreateSchema, categoryUpdateSchema } = require("../utils/zodSchemas");

router.get("/get-all", CategoryController.handleGetAllCategories);
router.get("/get-by-id/:id", CategoryController.handleGetCategoryById);
router.get("/get-by-slug/:slug", CategoryController.handleGetCategoryBySlug);

router.post(
  "/create",
  authenticateToken,
  authorizeRole(["admin"]),
  upload.single("image"),
  validate(categoryCreateSchema),
  CategoryController.handleCreateCategory
);
router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  upload.single("image"),
  validate(categoryUpdateSchema),
  CategoryController.handleUpdateCategory
);
router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  CategoryController.handleDeleteCategory
);

module.exports = router;
