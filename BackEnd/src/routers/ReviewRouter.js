const express = require("express");
const router = express.Router();
const ReviewController = require("../controller/ReviewController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

router.get("/product/:productId", ReviewController.handleGetReviewsByProduct);
router.post(
  "/create",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  ReviewController.handleCreateReview
);
router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  ReviewController.handleUpdateReview
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  ReviewController.handleDeleteReview
);
router.get(
  "/user",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  ReviewController.handleGetReviewsByUser
);
router.get(
  "/pending",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  ReviewController.handleGetPendingReviewProducts
);
router.post(
  "/like/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  ReviewController.handleToggleLikeReview
);
router.get(
  "/get-all",
  authenticateToken,
  authorizeRole(["admin"]),
  ReviewController.handleGetAllReviewsAdmin
);
module.exports = router;
