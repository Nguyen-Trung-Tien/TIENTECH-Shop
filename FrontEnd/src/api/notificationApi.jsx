import axiosClient from "../utils/axiosClient";

export const getNotificationsApi = async (page = 1, limit = 10, type = "all") => {
  try {
    const params = { page, limit };
    if (type && type !== "all") params.type = type;
    const res = await axiosClient.get("/notification/all", { params });
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

export const deleteNotificationApi = async (id) => {
  try {
    const res = await axiosClient.delete(`/notification/delete/${id}`);
    return res;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { errCode: -1 };
  }
};

export const clearAllNotificationsApi = async () => {
  try {
    const res = await axiosClient.delete("/notification/clear-all");
    return res;
  } catch (error) {
    console.error("Error clearing all notifications:", error);
    return { errCode: -1 };
  }
};

export const sendBroadcastNotificationApi = async (data) => {
  try {
    const res = await axiosClient.post("/notification/send-broadcast", data);
    return res;
  } catch (error) {
    console.error("Error sending broadcast notification:", error);
    return { errCode: -1, errMessage: error.response?.data?.errMessage || "Lỗi hệ thống" };
  }
};
