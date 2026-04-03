const express = require("express");
const router = express.Router();
const ProductController = require("../controller/ProductController");
const upload = require("./multer");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

router.post(
  "/create-new-product",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 20 },
  ]),
  authenticateToken,
  authorizeRole(["admin"]),
  ProductController.handleCreateProduct,
);
router.get("/get-all-product", ProductController.handleGetAllProducts);
router.get("/get-product/:id", ProductController.handleGetProductById);
router.get("/get-product-by-slug/:slug", ProductController.handleGetProductBySlug);
router.get("/search", ProductController.handleSearchProducts);
router.get("/search-suggest", ProductController.handleSearchSuggestions);

router.put(
  "/update-product/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 20 },
  ]),
  authenticateToken,
  authorizeRole(["admin"]),
  ProductController.handleUpdateProduct,
);
router.delete(
  "/delete-product/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  ProductController.handleDeleteProduct,
);

router.get("/discounted", ProductController.handleGetDiscountedProducts);
router.get("/flash-sale", ProductController.handleGetFlashSaleProducts);
router.get("/filter", ProductController.handleFilterProducts);
router.get("/recommend/:id", ProductController.handleRecommendProducts);
router.get("/smart-recommendations/:id", ProductController.handleGetSmartRecommendations);
router.get(
  "/recommend-fortune",
  ProductController.handleRecommendFortuneProducts,
);
router.get("/semantic-search", ProductController.handleSemanticSearch);

module.exports = router;
