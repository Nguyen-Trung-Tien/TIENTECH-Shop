const express = require("express");
const router = express.Router();
const ReviewReplyController = require("../controllers/ReviewReplyController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const { validate } = require("../middleware/zodMiddleware");
const { reviewReplySchema } = require("../utils/zodSchemas");

router.get("/review/:reviewId", ReviewReplyController.handleGetRepliesByReview);

router.post(
  "/create",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  validate(reviewReplySchema),
  ReviewReplyController.handleCreateReply
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  ReviewReplyController.handleDeleteReply
);

module.exports = router;
