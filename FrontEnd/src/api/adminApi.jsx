import axiosClient from "../utils/axiosClient";

export const getDashboard = async () => {
  try {
    const res = await axiosClient.get("/admin/dashboard");
    return res;
  } catch (error) {
    console.error("Error getting dashboard:", error);
    throw error;
  }
};
