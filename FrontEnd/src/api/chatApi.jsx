import axiosClient from "../utils/axiosClient";

export const sendMessage = async (message, userId = null, history = []) => {
  try {
    const payload = { message, userId, history };

    // Sử dụng axiosClient để đồng nhất config (baseURL, credentials, interceptors)
    const res = await axiosClient.post("/chat/ask", payload);

    return res; // axiosClient đã return res.data trong interceptor
  } catch (error) {
    console.error("Chatbot error:", error);

    if (error.response) {
      return `Lỗi server: ${
        error.response.data.error || "Không thể xử lý yêu cầu."
      }`;
    }

    if (error.code === "ECONNABORTED") {
      return "Máy chủ phản hồi quá lâu. Bạn thử lại giúp mình nhé!";
    }

    return "Lỗi không xác định. Vui lòng thử lại.";
  }
};

export const predictPrice = async (productId) => {
  try {
    const id = Number(productId);
    if (!id || isNaN(id) || id <= 0) {
      throw new Error("productId không hợp lệ");
    }

    const response = await axiosClient.post(
      "/chat/predict",
      { productId: id },
      { timeout: 125000 },
    );

    return response;
  } catch (error) {
    console.error("PricePredict error:", error);

    return {
      error:
        error.response?.data?.error ||
        error.message ||
        "Hệ thống dự đoán giá gặp sự cố.",
    };
  }
};

export const fengShuiChatApi = async (data) => {
  try {
    const res = await axiosClient.post("/chat/fengshui", data);
    return res;
  } catch (error) {
    console.error("FengShuiChatApi error:", error);
    return { error: error.response?.data?.error || "Hệ thống gặp sự cố." };
  }
};

export const visualSearch = async (image) => {
  try {
    const res = await axiosClient.post("/chat/visual-search", { image });
    return res;
  } catch (error) {
    console.error("VisualSearchApi error:", error);
    throw error;
  }
};
