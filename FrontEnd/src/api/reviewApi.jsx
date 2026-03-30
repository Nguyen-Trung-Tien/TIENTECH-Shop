import axiosClient from "../utils/axiosClient";

export const getReviewsByProductApi = async (
  productId,
  page = 1,
  limit = 10,
) => {
  try {
    const res = await axiosClient.get(`/review/product/${productId}`, {
      params: { page, limit },
    });
    return res;
  } catch (err) {
    console.error("Lỗi khi lấy đánh giá:", err);
    return { errCode: 1, errMessage: "Không thể tải đánh giá" };
  }
};

export const createReviewApi = async (payload) => {
  try {
    const res = await axiosClient.post(`/review/create`, payload);
    return res;
  } catch (err) {
    console.error(err);
  }
};

export const updateReviewApi = async (reviewId, payload) => {
  try {
    const res = await axiosClient.put(`review/update/${reviewId}`, payload);
    return res;
  } catch (err) {
    console.error("Lỗi cập nhật đánh giá:", err);
    return { errCode: 1, errMessage: "Cập nhật đánh giá thất bại" };
  }
};

export const deleteReviewApi = async (reviewId) => {
  try {
    const res = await axiosClient.delete(`review/delete/${reviewId}`);
    return res;
  } catch (err) {
    console.error("Lỗi xóa đánh giá:", err);
    return { errCode: 1, errMessage: "Xóa đánh giá thất bại" };
  }
};

export const getAllReviewsApi = async (
  page = 1,
  limit = 10,
  rating = "",
  status = "",
) => {
  try {
    const res = await axiosClient.get(`/review/get-all`, {
      params: { page, limit, rating, status },
    });
    return res;
  } catch (err) {
    console.error("Lỗi khi lấy tất cả đánh giá:", err);
    return { errCode: 1, errMessage: "Không thể tải đánh giá" };
  }
};

export const getReviewsByUserApi = async (page = 1, limit = 10) => {
  try {
    const res = await axiosClient.get(`/review/user`, {
      params: { page, limit },
    });
    return res;
  } catch (err) {
    console.error("Lỗi khi lấy lịch sử đơn hầng:", err);
    return { errCode: 1, errMessage: "Không thể tải lịch sử đơn hầng" };
  }
};

export const getPendingReviewsApi = async () => {
  try {
    const res = await axiosClient.get(`/review/pending`);
    return res;
  } catch (err) {
    console.error("Lỗi khi lấy ds chờ đánh giá:", err);
    return { errCode: 1, errMessage: "Thao tác thất bại" };
  }
};

export const toggleLikeReviewApi = async (reviewId) => {
  try {
    const res = await axiosClient.post(`/review/like/${reviewId}`);
    return res;
  } catch (err) {
    console.error("Lỗi khi like đánh giá:", err);
    return { errCode: 1, errMessage: "Thao tác thất bại" };
  }
};
