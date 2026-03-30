const ReviewService = require("../services/ReviewService");
const { uploadToCloudinary } = require("../config/cloudinaryConfig");

const handleGetReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const data = await ReviewService.getReviewsByProduct(
      productId,
      page,
      limit,
    );
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

const handleCreateReview = async (req, res) => {
  try {
    const { productId, rating, comment, images } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Missing required fields",
      });
    }

    let imageUrls = [];
    if (images && Array.isArray(images)) {
      for (const base64 of images) {
        const buffer = Buffer.from(base64.split(",")[1], "base64");
        const uploadRes = await uploadToCloudinary(buffer, "reviews");
        imageUrls.push(uploadRes.secure_url);
      }
    }

    const data = await ReviewService.createReview({
      userId: req.user.id,
      productId,
      rating,
      comment,
      images: imageUrls,
    });
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

const handleUpdateReview = async (req, res) => {
  const reviewId = req.params.id;
  const data = req.body;
  const user = req.user;

  const result = await ReviewService.updateReview(reviewId, data, user);
  return res.status(200).json(result);
};

const handleDeleteReview = async (req, res) => {
  const reviewId = req.params.id;
  const user = req.user;

  const result = await ReviewService.deleteReview(reviewId, user);
  return res.status(200).json(result);
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
      status,
    );
    return res.status(200).json(data);
  } catch (e) {
    console.error("Error getAllReviewsAdmin:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

const handleGetReviewsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const data = await ReviewService.getReviewsByUser(userId, page, limit);
    return res.status(200).json(data);
  } catch (e) {
    console.error("Error handleGetReviewsByUser:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
  }
};

const handleToggleLikeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await ReviewService.toggleLikeReview(id);
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error server",
    });
  }
};

const handleGetPendingReviewProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await ReviewService.getPendingReviewProducts(userId);
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from server",
    });
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
