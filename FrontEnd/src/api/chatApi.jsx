import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sendMessage = async (message, userId = null, history = []) => {
  try {
    const payload = { message, userId, history };

    const res = await API.post("/chat/ask", payload);

    return res.data; // Trả về { reply, recommendedProducts }
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
    if (!id || isNaN(id) || id <= 0) throw new Error("productId không hợp lệ");

    const response = await API.post(
      "/chat/predict",
      { productId: id },
      { timeout: 125000 }
    );

    return response.data;
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
    const res = await API.post("chat/fengshui", data);
    return res.data;
  } catch (error) {
    console.error("FengShuiChatApi error:", error);
    return { error: error.response?.data?.error || "Hệ thống gặp sự cố." };
  }
};

export const visualSearch = async (image) => {
  try {
    const res = await API.post("/chat/visual-search", { image });
    return res.data;
  } catch (error) {
    console.error("VisualSearchApi error:", error);
    throw error;
  }
};
