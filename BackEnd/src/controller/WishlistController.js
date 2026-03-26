const WishlistService = require("../services/WishlistService");

const handleAddToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ errCode: 1, errMessage: "Thiếu productId" });
    }
    const result = await WishlistService.addToWishlist(userId, productId);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errCode: -1, errMessage: "Lỗi từ server" });
  }
};

const handleRemoveFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ errCode: 1, errMessage: "Thiếu productId" });
    }
    const result = await WishlistService.removeFromWishlist(userId, productId);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errCode: -1, errMessage: "Lỗi từ server" });
  }
};

const handleGetWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await WishlistService.getWishlistByUserId(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errCode: -1, errMessage: "Lỗi từ server" });
  }
};

const handleCheckIsInWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const result = await WishlistService.checkIsInWishlist(userId, productId);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errCode: -1, errMessage: "Lỗi từ server" });
  }
};

module.exports = {
  handleAddToWishlist,
  handleRemoveFromWishlist,
  handleGetWishlist,
  handleCheckIsInWishlist
};
