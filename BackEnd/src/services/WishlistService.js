const db = require("../models");

const addToWishlist = async (userId, productId) => {
  try {
    const product = await db.Product.findByPk(productId);
    if (!product) {
      return { errCode: 1, errMessage: "Sản phẩm không tồn tại" };
    }

    const [wishlistItem, created] = await db.Wishlist.findOrCreate({
      where: { userId, productId },
      defaults: { userId, productId },
    });

    if (!created) {
      return { errCode: 2, errMessage: "Sản phẩm đã có trong danh sách yêu thích" };
    }

    return { errCode: 0, errMessage: "Đã thêm vào danh sách yêu thích", data: wishlistItem };
  } catch (error) {
    console.error("addToWishlist error:", error);
    return { errCode: -1, errMessage: "Lỗi từ server" };
  }
};

const removeFromWishlist = async (userId, productId) => {
  try {
    const deleted = await db.Wishlist.destroy({
      where: { userId, productId },
    });

    if (deleted === 0) {
      return { errCode: 1, errMessage: "Sản phẩm không có trong danh sách yêu thích" };
    }

    return { errCode: 0, errMessage: "Đã xóa khỏi danh sách yêu thích" };
  } catch (error) {
    console.error("removeFromWishlist error:", error);
    return { errCode: -1, errMessage: "Lỗi từ server" };
  }
};

const getWishlistByUserId = async (userId) => {
  try {
    const wishlist = await db.Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: db.Product,
          as: "product",
          include: [
            {
              model: db.ProductImage,
              as: "images",
              where: { isPrimary: true },
              required: false,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return { errCode: 0, errMessage: "OK", data: wishlist };
  } catch (error) {
    console.error("getWishlistByUserId error:", error);
    return { errCode: -1, errMessage: "Lỗi từ server" };
  }
};

const checkIsInWishlist = async (userId, productId) => {
    try {
        const item = await db.Wishlist.findOne({
            where: { userId, productId }
        });
        return { errCode: 0, isInWishlist: !!item };
    } catch (error) {
        console.error("checkIsInWishlist error:", error);
        return { errCode: -1, errMessage: "Lỗi từ server" };
    }
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlistByUserId,
  checkIsInWishlist
};
