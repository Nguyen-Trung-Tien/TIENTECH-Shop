const express = require("express");
const router = express.Router();
const BrandController = require("../controller/BrandController");
const upload = require("./multer");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

router.get("/get-all", BrandController.handleGetAllBrands);
router.get("/get-by-id/:id", BrandController.handleGetBrandById);
router.get("/get-by-slug/:slug", BrandController.handleGetBrandBySlug);

router.post(
  "/create",
  authenticateToken,
  authorizeRole(["admin"]),
  upload.single("image"),
  BrandController.handleCreateBrand
);

router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  upload.single("image"),
  BrandController.handleUpdateBrand
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  BrandController.handleDeleteBrand
);

module.exports = router;
