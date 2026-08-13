const db = require("../../models");

const getRepliesByReview = async (reviewId) => {
  try {
    const replies = await db.ReviewReply.findAll({
      where: { reviewId },
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username", "avatar", "role"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return { errCode: 0, data: replies };
  } catch (err) {
    console.error(err);
    return { errCode: 1, errMessage: "Lỗi khi lấy reply" };
  }
};

const createReply = async (data) => {
  try {
    const newReply = await db.ReviewReply.create({
      reviewId: data.reviewId,
      userId: data.userId,
      comment: data.comment,
    });

    const replyWithUser = await db.ReviewReply.findByPk(newReply.id, {
      include: [
        {
          model: db.User,
          as: "user",
          attributes: ["id", "username", "avatar", "role"],
        },
      ],
    });

    return { errCode: 0, data: replyWithUser };
  } catch (err) {
    console.error(err);
    return { errCode: 1, errMessage: "Lỗi khi tạo reply" };
  }
};

const deleteReply = async (replyId, user) => {
  try {
    const reply = await db.ReviewReply.findByPk(replyId);
    if (!reply) return { errCode: 2, errMessage: "Reply không tồn tại" };

    if (user.role !== "admin" && reply.userId !== user.id) {
      return { errCode: 3, errMessage: "Bạn không có quyền xóa reply này" };
    }

    await reply.destroy();
    return { errCode: 0, message: "Đã xóa reply" };
  } catch (err) {
    console.error(err);
    return { errCode: 1, errMessage: "Lỗi khi xóa reply" };
  }
};

module.exports = {
  getRepliesByReview,
  createReply,
  deleteReply,
};
