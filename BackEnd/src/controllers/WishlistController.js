const WishlistService = require("../services/marketing/WishlistService");
const { handleResponse, handleError } = require("../utils/controllerHelper");

const handleAddToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({
        status: "BAD_REQUEST",
        statusCode: 400,
        errCode: 1,
        errMessage: "productId là bắt buộc",
      });
    }
    const result = await WishlistService.addToWishlist(userId, productId);
    return handleResponse(res, result, 201);
  } catch (error) {
    return handleError(res, error, "handleAddToWishlist");
  }
};

const handleRemoveFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({
        status: "BAD_REQUEST",
        statusCode: 400,
        errCode: 1,
        errMessage: "productId là bắt buộc",
      });
    }
    const result = await WishlistService.removeFromWishlist(userId, productId);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleRemoveFromWishlist");
  }
};

const handleGetWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await WishlistService.getWishlistByUserId(userId);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleGetWishlist");
  }
};

const handleCheckIsInWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const result = await WishlistService.checkIsInWishlist(userId, productId);
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleCheckIsInWishlist");
  }
};

module.exports = {
  handleAddToWishlist,
  handleRemoveFromWishlist,
  handleGetWishlist,
  handleCheckIsInWishlist,
};
