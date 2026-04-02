const express = require("express");
const router = express.Router();
const BrandController = require("../controller/BrandController");
const upload = require("./multer");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

router.post(
  "/create-new-brand",
  upload.single("image"),
  authenticateToken,
  authorizeRole(["admin"]),
  BrandController.handleCreateBrand
);

router.get("/get-all-brand", BrandController.handleGetAllBrands);
router.get("/get-brand/:id", BrandController.handleGetBrandById);
router.get("/get-brand-by-slug/:slug", BrandController.handleGetBrandBySlug);


router.put(
  "/update-brand/:id",
  upload.single("image"),
  authenticateToken,
  authorizeRole(["admin"]),
  BrandController.handleUpdateBrand
);

router.delete(
  "/delete-brand/:id",
  authenticateToken,
  authorizeRole(["admin"]),
  BrandController.handleDeleteBrand
);

module.exports = router;
