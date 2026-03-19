import axios from "axios";
import { removeUser } from "../redux/userSlice";
import { store } from "../redux/store";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Quan trọng: Cho phép gửi/nhận cookie
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Đảm bảo mọi request đều mang theo credentials
    config.withCredentials = true;
    config.headers["Cache-Control"] = "no-cache";
    config.headers["Pragma"] = "no-cache";
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và không phải request refresh token
    const isRefreshRequest = originalRequest.url.includes("/user/refresh-token");

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi Refresh Token
        await axios.post(`${import.meta.env.VITE_API_URL}/user/refresh-token`, {}, { withCredentials: true });
        
        isRefreshing = false;
        processQueue(null);

        return axiosClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        
        // Chỉ logout nếu thực sự hết phiên (tránh logout nhầm khi mất mạng)
        if (refreshError.response?.status === 403 || refreshError.response?.status === 400) {
            store.dispatch(removeUser());
            if (!window.location.pathname.includes("/login")) {
                window.location.href = `/login?from=${window.location.pathname}`;
            }
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
