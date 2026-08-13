import axiosClient from "../utils/axiosClient";

export const getNotificationsApi = async (page = 1, limit = 10) => {
  try {
    const res = await axiosClient.get(`/notification/all?page=${page}&limit=${limit}`);
    return res;
  } catch (error) {
    if (error?.response?.status !== 404) {
      console.error("Error getting notifications:", error);
    }
    return { errCode: -1, data: [], unreadCount: 0 };
  }
};

export const markAsReadApi = async (id) => {
  try {
    const res = await axiosClient.put(`/notification/mark-read/${id}`);
    return res;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { errCode: -1 };
  }
};

export const markAllReadApi = async () => {
  try {
    const res = await axiosClient.put("/notification/mark-all-read");
    return res;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { errCode: -1 };
  }
};
