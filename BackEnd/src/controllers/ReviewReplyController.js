const ReviewReplyService = require("../services/marketing/ReviewReplyService");
const { handleResponse, handleError } = require("../utils/controllerHelper");

const handleGetRepliesByReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const result = await ReviewReplyService.getRepliesByReview(reviewId);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleGetRepliesByReview");
  }
};

const handleCreateReply = async (req, res) => {
  try {
    const data = {
      reviewId: req.body.reviewId,
      userId: req.user.id,
      comment: req.body.comment,
    };
    const result = await ReviewReplyService.createReply(data);
    return handleResponse(res, result, 201);
  } catch (e) {
    return handleError(res, e, "handleCreateReply");
  }
};

const handleDeleteReply = async (req, res) => {
  try {
    const replyId = req.params.id;
    const user = req.user;
    const result = await ReviewReplyService.deleteReply(replyId, user);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleDeleteReply");
  }
};

module.exports = {
  handleGetRepliesByReview,
  handleCreateReply,
  handleDeleteReply,
};
