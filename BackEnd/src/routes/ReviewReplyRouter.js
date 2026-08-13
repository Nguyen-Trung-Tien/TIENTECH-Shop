const express = require("express");
const router = express.Router();
const ReviewReplyController = require("../controllers/ReviewReplyController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

router.get("/review/:reviewId", ReviewReplyController.handleGetRepliesByReview);

router.post(
  "/create",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  ReviewReplyController.handleCreateReply
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(["admin", "customer"]),
  ReviewReplyController.handleDeleteReply
);

module.exports = router;
