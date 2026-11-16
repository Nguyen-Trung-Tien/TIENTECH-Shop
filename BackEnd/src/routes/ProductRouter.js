const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const upload = require("./multer");
const {
  authenticateToken,
  optionalAuthenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const { validate } = require("../middleware/zodMiddleware");
const { createProductSchema, updateProductSchema } = require("../middleware/schemas/productSchema");
const { aiApiLimiter } = require("../middleware/rateLimiter");

router.post(
  "/create-new-product",
  authenticateToken,
  authorizeRole(["admin"]),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 20 },
  ]),
  validate(createProductSchema),
  ProductController.handleCreateProduct,
);
router.get("/get-all-product", optionalAuthenticateToken, ProductController.handleGetAllProducts);
router.get("/home-data", ProductController.handleGetHomePageData);
router.get("/get-product/:id", ProductController.handleGetProductById);
router.get("/get-product-by-slug/:slug", ProductController.handleGetProductBySlug);
router.get("/search", ProductController.handleSearchProducts);
router.get("/search-suggest", ProductController.handleSearchSuggestions);

router.put(
  "/update-product/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 20 },
  ]),
  validate(updateProductSchema),
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
router.get("/filter", optionalAuthenticateToken, ProductController.handleFilterProducts);
router.get("/recommend/:id", aiApiLimiter, ProductController.handleRecommendProducts);
router.get("/smart-recommendations/:id", aiApiLimiter, ProductController.handleGetSmartRecommendations);
router.get("/personalized", optionalAuthenticateToken, ProductController.handleGetPersonalizedRecommendations);
router.get(
  "/recommend-fortune",
  aiApiLimiter,
  ProductController.handleRecommendFortuneProducts,
);
router.get("/semantic-search", aiApiLimiter, ProductController.handleSemanticSearch);

module.exports = router;
