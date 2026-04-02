const express = require("express");
const router = express.Router();
const CategoryController = require("../controller/CategoryController");
const upload = require("./multer");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

router.get("/get-all-category", CategoryController.handleGetAllCategories);
router.get("/get-category/:id", CategoryController.handleGetCategoryById);
router.get("/get-category-by-slug/:slug", CategoryController.handleGetCategoryBySlug);

router.post(
  "/create",
  authenticateToken,
  authorizeRole(["admin"]),
  upload.single("image"),
  CategoryController.handleCreateCategory
);
router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  upload.single("image"),
  CategoryController.handleUpdateCategory
);
router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  CategoryController.handleDeleteCategory
);

module.exports = router;
