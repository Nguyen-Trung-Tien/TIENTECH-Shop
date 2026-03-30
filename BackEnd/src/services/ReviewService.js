const db = require("../models");

const getReviewsByProduct = async (productId, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Review.findAndCountAll({
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
      limit: limit,
      offset: offset,
    });

    const reviewIds = rows.map((r) => r.id);
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
      data: rows.map((r) => ({
        ...r.toJSON(),
        replies: repliesByReviewId[r.id] || [],
      })),
      pagination: {
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error(error);
    return { errCode: 1, errMessage: "Error from server!" };
  }
};

const createReview = async (data) => {
  try {
    const newReview = await db.Review.create({
      userId: data.userId,
      productId: data.productId,
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
    const where = {};
    const offset = (page - 1) * limit;

    if (rating) where.rating = rating;

    if (status) {
      where.isApproved = status === "approved";
    }

    const { count, rows } = await db.Review.findAndCountAll({
      where,
      limit,
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

    return {
      errCode: 0,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error("Get All Reviews Admin Error:", error);
    return { errCode: 1, errMessage: "Lỗi server" };
  }
};

const getReviewsByUser = async (userId, page = 1, limit = 10) => {
  // ... (giữ nguyên logic đã sửa ở bước trước)
  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Review.findAndCountAll({
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
      limit: limit,
      offset: offset,
    });

    const reviewIds = rows.map((r) => r.id);
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
      data: rows.map((r) => ({
        ...r.toJSON(),
        replies: repliesByReviewId[r.id] || [],
      })),
      pagination: {
        total: count,
        page: page,
        limit: limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    console.error("Error getReviewsByUser:", error);
    return { errCode: 1, errMessage: "Error from server!" };
  }
};

const getPendingReviewProducts = async (userId) => {
  try {
    // 1. Lấy tất cả các OrderItems từ các đơn hàng đã "delivered" của user này
    const deliveredOrders = await db.Order.findAll({
      where: { userId, status: "delivered" },
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

    // Gom tất cả sản phẩm duy nhất đã mua
    const purchasedProductsMap = {};
    deliveredOrders.forEach((order) => {
      order.orderItems.forEach((item) => {
        purchasedProductsMap[item.productId] = {
          id: item.productId,
          name: item.productName,
          image: item.image,
        };
      });
    });

    const purchasedProductIds = Object.keys(purchasedProductsMap);

    // 2. Lấy tất cả các review mà user này đã viết
    const existingReviews = await db.Review.findAll({
      where: { userId, productId: purchasedProductIds },
      attributes: ["productId"],
    });

    const reviewedProductIds = existingReviews.map((r) => String(r.productId));

    // 3. Lọc ra những sản phẩm đã mua nhưng chưa review
    const pendingProducts = purchasedProductIds
      .filter((id) => !reviewedProductIds.includes(String(id)))
      .map((id) => purchasedProductsMap[id]);

    return { errCode: 0, data: pendingProducts };
  } catch (error) {
    console.error("Error getPendingReviewProducts:", error);
    return { errCode: 1, errMessage: "Lỗi server" };
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
};
