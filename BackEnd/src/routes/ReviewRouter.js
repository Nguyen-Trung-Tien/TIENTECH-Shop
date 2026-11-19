const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/ReviewController");
const {
  authenticateToken,
  optionalAuthenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

const { validate } = require("../middleware/zodMiddleware");
const { reviewSchema, updateReviewSchema, idParamSchema } = require("../utils/zodSchemas");
const { reviewMutationLimiter } = require("../middleware/rateLimiter");

router.get("/product/:productId", optionalAuthenticateToken, ReviewController.handleGetReviewsByProduct);
router.post(
  "/create",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  reviewMutationLimiter,
  validate(reviewSchema),
  ReviewController.handleCreateReview
);
router.put(
  "/update/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  reviewMutationLimiter,
  validate(updateReviewSchema),
  ReviewController.handleUpdateReview
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  reviewMutationLimiter,
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
  validate(idParamSchema),
  ReviewController.handleToggleLikeReview
);
router.get(
  "/get-all",
  authenticateToken,
  authorizeRole(["admin"]),
  ReviewController.handleGetAllReviewsAdmin
);
module.exports = router;
