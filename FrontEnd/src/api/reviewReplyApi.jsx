import axiosClient from "../utils/axiosClient";

export const createReplyApi = async (payload) => {
  try {
    const res = await axiosClient.post(`/review-reply/create`, payload);
    return res;
  } catch (err) {
    console.error(err);
    return { errCode: 1, errMessage: "Không thể tạo reply" };
  }
};

export const deleteReplyApi = async (replyId) => {
  try {
    const res = await axiosClient.delete(`/review-reply/${replyId}`);
    return res;
  } catch (err) {
    console.error(err);
    return { errCode: 1, errMessage: "Không thể xóa reply" };
  }
};
