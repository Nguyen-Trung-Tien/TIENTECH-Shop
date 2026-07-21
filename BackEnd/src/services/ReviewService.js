const db = require("../models");

const { getPagination, getPagingData } = require("../utils/paginationHelper");

const getReviewsByProduct = async (productId, page = 1, limit = 10, userId = null) => {
  try {
    const { offset, limit: l } = getPagination(page, limit);

    const data = await db.Review.findAndCountAll({
      where: { productId, isApproved: true },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username", "avatar"],
        },
        {
          model: db.ReviewImage,
          as: "images",
          attributes: ["id", "imageUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: l,
      offset: offset,
    });

    const pagingData = getPagingData(data, page, l);

    const reviewIds = pagingData.items.map((r) => r.id);
    let repliesByReviewId = {};
    if (reviewIds.length > 0) {
      const replies = await db.ReviewReply.findAll({
        where: { reviewId: reviewIds },
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["id", "username", "avatar"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      repliesByReviewId = replies.reduce((acc, rep) => {
        const key = rep.reviewId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(rep);
        return acc;
      }, {});
    }

    let likedReviewIds = new Set();
    if (userId && reviewIds.length > 0) {
      const likes = await db.ReviewLike.findAll({
        where: {
          userId,
          reviewId: reviewIds,
        },
        attributes: ["reviewId"],
      });
      likedReviewIds = new Set(likes.map((lk) => lk.reviewId));
    }

    return {
      errCode: 0,
      data: pagingData.items.map((r) => ({
        ...r.toJSON(),
        replies: repliesByReviewId[r.id] || [],
        isLiked: likedReviewIds.has(r.id),
      })),
      pagination: {
        totalItems: pagingData.totalItems,
        currentPage: pagingData.currentPage,
        totalPages: pagingData.totalPages,
        limit: l,
      },
    };
  } catch (error) {
    console.error(error);
    return { errCode: 1, errMessage: "Error from server!" };
  }
};

const createReview = async (data) => {
  try {
    const productId = Number(data.productId);
    // 1. Kiểm tra xem người dùng đã mua sản phẩm này bao nhiêu lần và đơn hàng đã ở trạng thái 'delivered' hoặc 'completed' chưa
    const deliveredOrders = await db.Order.findAll({
      where: {
        userId: data.userId,
        status: { [db.Sequelize.Op.in]: ["delivered", "completed"] },
      },
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          where: { productId },
        },
      ],
    });

    let purchaseCount = 0;
    deliveredOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        if (Number(item.productId) === productId) {
          purchaseCount += 1;
        }
      });
    });

    if (purchaseCount === 0) {
      return {
        errCode: 2,
        errMessage: "Bạn chỉ có thể đánh giá sản phẩm sau khi đã nhận hàng",
      };
    }

    // 2. Đếm số lượng đánh giá đã viết cho sản phẩm này
    const reviewCount = await db.Review.count({
      where: { userId: data.userId, productId },
    });

    if (reviewCount >= purchaseCount) {
      return {
        errCode: 3,
        errMessage: "Bạn đã đánh giá sản phẩm này rồi (đã đánh giá đủ số lần mua hàng)",
      };
    }

    const newReview = await db.Review.create({
      userId: data.userId,
      productId,
      rating: data.rating,
      comment: data.comment,
    });

    if (data.images && data.images.length > 0) {
      const imageData = data.images.map((img) => ({
        reviewId: newReview.id,
        imageUrl: img,
      }));
      await db.ReviewImage.bulkCreate(imageData);
    }

    return { errCode: 0, data: newReview };
  } catch (error) {
    console.error(error);
    return { errCode: 1, errMessage: "Lỗi khi tạo đánh giá" };
  }
};

const updateReview = async (reviewId, data, user) => {
  try {
    const review = await db.Review.findByPk(reviewId);

    if (!review) return { errCode: 2, errMessage: "Review không tồn tại" };

    if (user.role !== "admin" && review.userId !== user.id) {
      return {
        errCode: 3,
        errMessage: "Bạn không có quyền chỉnh sửa review này",
      };
    }

    review.rating = data.rating ?? review.rating;
    review.comment = data.comment ?? review.comment;

    await review.save();

    return { errCode: 0, data: review };
  } catch (error) {
    console.error(error);
    return { errCode: 1, errMessage: "Lỗi khi cập nhật đánh giá" };
  }
};

const deleteReview = async (reviewId, user) => {
  try {
    const review = await db.Review.findByPk(reviewId);

    if (!review) return { errCode: 2, errMessage: "Review không tồn tại" };

    if (user.role !== "admin" && review.userId !== user.id) {
      return { errCode: 3, errMessage: "Bạn không có quyền xóa review này" };
    }

    await review.destroy();

    return { errCode: 0, message: "Đã xóa đánh giá" };
  } catch (error) {
    console.error(error);
    return { errCode: 1, errMessage: "Lỗi khi xóa đánh giá" };
  }
};

const getAllReviewsAdmin = async (
  page = 1,
  limit = 10,
  rating = "",
  status = "",
) => {
  try {
    const { offset, limit: l } = getPagination(page, limit);
    const where = {};

    if (rating) where.rating = rating;

    if (status) {
      where.isApproved = status === "approved";
    }

    const data = await db.Review.findAndCountAll({
      where,
      limit: l,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username"],
        },
        {
          model: db.Product,
          as: "product",
          attributes: ["id", "name"],
        },
      ],
    });

    const pagingData = getPagingData(data, page, l);

    return {
      errCode: 0,
      data: pagingData.items,
      pagination: {
        totalItems: pagingData.totalItems,
        currentPage: pagingData.currentPage,
        totalPages: pagingData.totalPages,
        limit: l,
      },
    };
  } catch (error) {
    console.error("Get All Reviews Admin Error:", error);
    return { errCode: 1, errMessage: "Lỗi server" };
  }
};

const getReviewsByUser = async (userId, page = 1, limit = 10) => {
  try {
    const { offset, limit: l } = getPagination(page, limit);

    const data = await db.Review.findAndCountAll({
      where: { userId },
      include: [
        {
          model: db.Product,
          as: "product",
          attributes: ["id", "name"],
          include: [
            {
              model: db.ProductVariant,
              as: "variants",
              attributes: ["id"],
              limit: 1,
            },
          ],
        },
        {
          model: db.ReviewImage,
          as: "images",
          attributes: ["id", "imageUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: l,
      offset: offset,
    });

    const pagingData = getPagingData(data, page, l);

    const reviewIds = pagingData.items.map((r) => r.id);
    let repliesByReviewId = {};
    if (reviewIds.length > 0) {
      const replies = await db.ReviewReply.findAll({
        where: { reviewId: reviewIds },
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["id", "username", "avatar"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      repliesByReviewId = replies.reduce((acc, rep) => {
        const key = rep.reviewId;
        if (!acc[key]) acc[key] = [];
        acc[key].push(rep);
        return acc;
      }, {});
    }

    return {
      errCode: 0,
      data: pagingData.items.map((r) => ({
        ...r.toJSON(),
        replies: repliesByReviewId[r.id] || [],
      })),
      pagination: {
        totalItems: pagingData.totalItems,
        currentPage: pagingData.currentPage,
        totalPages: pagingData.totalPages,
        limit: l,
      },
    };
  } catch (error) {
    console.error("Error getReviewsByUser:", error);
    return { errCode: 1, errMessage: "Error from server!" };
  }
};

const getPendingReviewProducts = async (userId) => {
  try {
    // 1. Lấy tất cả các OrderItems từ các đơn hàng đã "delivered" hoặc "completed" của user này
    const deliveredOrders = await db.Order.findAll({
      where: {
        userId,
        status: { [db.Sequelize.Op.in]: ["delivered", "completed"] },
      },
      include: [
        {
          model: db.OrderItem,
          as: "orderItems",
          attributes: ["productId", "productName", "image"],
        },
      ],
    });

    if (!deliveredOrders || deliveredOrders.length === 0) {
      return { errCode: 0, data: [] };
    }

    // Gom tất cả sản phẩm và đếm số lần đã mua
    const purchasedProductsMap = {}; // productId -> { id, name, image, purchaseCount }
    deliveredOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const pid = Number(item.productId);
        if (!purchasedProductsMap[pid]) {
          purchasedProductsMap[pid] = {
            id: pid,
            name: item.productName,
            image: item.image,
            purchaseCount: 0,
          };
        }
        purchasedProductsMap[pid].purchaseCount += 1;
      });
    });

    const purchasedProductIds = Object.keys(purchasedProductsMap).map(Number);

    // 2. Lấy tất cả các review mà user này đã viết cho những sản phẩm này
    const existingReviews = await db.Review.findAll({
      where: { userId, productId: purchasedProductIds },
      attributes: ["productId"],
    });

    const reviewCounts = {}; // productId -> reviewCount
    existingReviews.forEach((r) => {
      const pid = Number(r.productId);
      reviewCounts[pid] = (reviewCounts[pid] || 0) + 1;
    });

    // 3. Lọc ra những sản phẩm có số lần mua hàng lớn hơn số lần đánh giá đã viết
    const pendingProducts = purchasedProductIds
      .filter((id) => {
        const pCount = purchasedProductsMap[id].purchaseCount;
        const rCount = reviewCounts[id] || 0;
        return rCount < pCount;
      })
      .map((id) => ({
        id: purchasedProductsMap[id].id,
        name: purchasedProductsMap[id].name,
        image: purchasedProductsMap[id].image,
      }));

    return { errCode: 0, data: pendingProducts };
  } catch (error) {
    console.error("Error getPendingReviewProducts:", error);
    return { errCode: 1, errMessage: "Lỗi server" };
  }
};

const toggleLikeReview = async (reviewId, userId) => {
  try {
    if (!reviewId) {
      return { errCode: 2, errMessage: "ID đánh giá không hợp lệ" };
    }
    if (!userId) {
      return { errCode: 3, errMessage: "Vui lòng đăng nhập" };
    }

    const review = await db.Review.findByPk(reviewId);
    if (!review) {
      return { errCode: 2, errMessage: "Review không tồn tại" };
    }

    // Kiểm tra xem user đã like review này chưa
    const existingLike = await db.ReviewLike.findOne({
      where: { reviewId, userId },
    });

    if (existingLike) {
      // Unlike: Xoá record ReviewLike, giảm count likes của Review
      await existingLike.destroy();
      
      const newLikesCount = Math.max(0, (review.likes || 0) - 1);
      await db.Review.update({ likes: newLikesCount }, { where: { id: reviewId } });
      
      const updatedReview = await db.Review.findByPk(reviewId);
      return { errCode: 0, data: { ...updatedReview.toJSON(), isLiked: false } };
    } else {
      // Like: Tạo record ReviewLike, tăng count likes của Review
      await db.ReviewLike.create({ reviewId, userId });
      
      await db.Review.increment("likes", { by: 1, where: { id: reviewId } });
      
      const updatedReview = await db.Review.findByPk(reviewId);
      return { errCode: 0, data: { ...updatedReview.toJSON(), isLiked: true } };
    }
  } catch (error) {
    console.error("Error toggleLikeReview:", error);
    return { errCode: 1, errMessage: "Lỗi khi like đánh giá: " + error.message };
  }
};

module.exports = {
  createReview,
  getReviewsByProduct,
  deleteReview,
  updateReview,
  getAllReviewsAdmin,
  getReviewsByUser,
  getPendingReviewProducts,
  toggleLikeReview,
};
