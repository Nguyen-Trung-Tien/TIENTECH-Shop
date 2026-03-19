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

export const exportRevenue = async () => {
  try {
    const res = await axiosClient.get("/admin/export-revenue", {
      responseType: "blob",
    });
    return res;
  } catch (error) {
    console.error("Error exporting revenue:", error);
    throw error;
  }
};

export const getAIInsights = async () => {
  try {
    const res = await axiosClient.get("/admin/ai-insights");
    return res;
  } catch (error) {
    console.error("Error getting AI insights:", error);
    throw error;
  }
};
