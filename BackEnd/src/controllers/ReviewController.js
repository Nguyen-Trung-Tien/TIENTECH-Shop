const ReviewService = require("../services/marketing/ReviewService");
const { uploadToCloudinary } = require("../config/cloudinaryConfig");
const { handleResponse, handleError } = require("../utils/controllerHelper");

const handleGetReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const userId = req.user?.id || null;
    const rating = req.query.rating || null;
    const hasImage = req.query.hasImage === "true" || req.query.hasImage === true;

    const data = await ReviewService.getReviewsByProduct(
      productId,
      page,
      limit,
      userId,
      rating,
      hasImage
    );
    return handleResponse(res, data, 200);
  } catch (e) {
    return handleError(res, e, "handleGetReviewsByProduct");
  }
};

const handleCreateReview = async (req, res) => {
  try {
    const { productId, rating, comment, images } = req.body;
    if (productId === undefined || productId === null || productId === "") {
      return res.status(400).json({
        status: "BAD_REQUEST",
        statusCode: 400,
        errCode: 1,
        errMessage: "productId là bắt buộc",
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        status: "BAD_REQUEST",
        statusCode: 400,
        errCode: 1,
        errMessage: "Điểm đánh giá phải từ 1 đến 5 sao",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        status: "BAD_REQUEST",
        statusCode: 400,
        errCode: 1,
        errMessage: "Nội dung đánh giá không được để trống",
      });
    }

    let imageUrls = [];
    if (images && Array.isArray(images)) {
      for (const img of images) {
        if (typeof img === "string" && img.startsWith("data:image")) {
          const parts = img.split(",");
          if (parts[1]) {
            const buffer = Buffer.from(parts[1], "base64");
            const uploadRes = await uploadToCloudinary(buffer, "reviews");
            imageUrls.push(uploadRes.secure_url);
          }
        } else if (typeof img === "string" && img.startsWith("http")) {
          imageUrls.push(img);
        }
      }
    }

    const data = await ReviewService.createReview({
      userId: req.user.id,
      productId,
      rating,
      comment,
      images: imageUrls,
    });
    return handleResponse(res, data, 201);
  } catch (e) {
    return handleError(res, e, "handleCreateReview");
  }
};

const handleUpdateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const data = req.body;
    const user = req.user;

    const result = await ReviewService.updateReview(reviewId, data, user);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleUpdateReview");
  }
};

const handleDeleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const user = req.user;

    const result = await ReviewService.deleteReview(reviewId, user);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleDeleteReview");
  }
};

const handleGetAllReviewsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const rating = req.query.rating || "";
    const status = req.query.status || "";

    const data = await ReviewService.getAllReviewsAdmin(
      page,
      limit,
      rating,
      status
    );
    return handleResponse(res, data, 200);
  } catch (e) {
    return handleError(res, e, "handleGetAllReviewsAdmin");
  }
};

const handleGetReviewsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const data = await ReviewService.getReviewsByUser(userId, page, limit);
    return handleResponse(res, data, 200);
  } catch (e) {
    return handleError(res, e, "handleGetReviewsByUser");
  }
};

const handleToggleLikeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const data = await ReviewService.toggleLikeReview(id, userId);
    return handleResponse(res, data, 200);
  } catch (e) {
    return handleError(res, e, "handleToggleLikeReview");
  }
};

const handleGetPendingReviewProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await ReviewService.getPendingReviewProducts(userId);
    return handleResponse(res, data, 200);
  } catch (e) {
    return handleError(res, e, "handleGetPendingReviewProducts");
  }
};

module.exports = {
  handleGetReviewsByProduct,
  handleCreateReview,
  handleDeleteReview,
  handleUpdateReview,
  handleGetAllReviewsAdmin,
  handleGetReviewsByUser,
  handleToggleLikeReview,
  handleGetPendingReviewProducts,
};
