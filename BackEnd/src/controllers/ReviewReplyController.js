const ReviewReplyService = require("../services/marketing/ReviewReplyService");

const handleGetRepliesByReview = async (req, res) => {
  const { reviewId } = req.params;
  const result = await ReviewReplyService.getRepliesByReview(reviewId);
  return res.status(200).json(result);
};

const handleCreateReply = async (req, res) => {
  const data = {
    reviewId: req.body.reviewId,
    userId: req.user.id,
    comment: req.body.comment,
  };
  const result = await ReviewReplyService.createReply(data);
  return res.status(200).json(result);
};

const handleDeleteReply = async (req, res) => {
  const replyId = req.params.id;
  const user = req.user;
  const result = await ReviewReplyService.deleteReply(replyId, user);
  return res.status(200).json(result);
};

module.exports = {
  handleGetRepliesByReview,
  handleCreateReply,
  handleDeleteReply,
};
