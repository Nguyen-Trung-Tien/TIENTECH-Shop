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

export const globalSearchApi = async (query) => {
  try {
    const res = await axiosClient.get(`/admin/global-search?q=${encodeURIComponent(query)}`);
    return res;
  } catch (error) {
    console.error("Error in global search API:", error);
    throw error;
  }
};

export const syncEmbeddings = async () => {
  try {
    const res = await axiosClient.post("/admin/sync-embeddings");
    return res;
  } catch (error) {
    console.error("Error syncing embeddings:", error);
    throw error;
  }
};

export const getRevenueStats = async (period) => {
  try {
    const res = await axiosClient.get(`/admin/dashboard?period=${period}`);
    return res;
  } catch (error) {
    console.error("Error getting revenue stats:", error);
    throw error;
  }
};
