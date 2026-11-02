import axios from "axios";
import { appConfig } from "../config/runtimeConfig";
import { removeUser } from "../redux/userSlice";
import { clearCart } from "../redux/cartSlice";
import { store } from "../redux/store";

const axiosClient = axios.create({
  baseURL: appConfig.apiUrl,
  withCredentials: true,
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

axiosClient.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    config.headers["Cache-Control"] = "no-cache";
    config.headers["Pragma"] = "no-cache";
    return config;
  },
  (error) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url?.includes("/user/refresh-token");

    // Intercept Account Locked error (403 with code ACCOUNT_LOCKED or lock message)
    const errData = error.response?.data;
    const isLockedError =
      error.response?.status === 403 &&
      (errData?.code === "ACCOUNT_LOCKED" ||
        (typeof errData?.errMessage === "string" &&
          errData.errMessage.toLowerCase().includes("khóa")));

    if (isLockedError) {
      const reason =
        errData?.errMessage || "Tài khoản của bạn đã bị quản trị viên khóa.";
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tiêntech:account_locked", {
            detail: { reason },
          })
        );
      }
      store.dispatch(removeUser());
      store.dispatch(clearCart());
      if (errData?.errMessage) {
        error.errMessage = errData.errMessage;
      }
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest
    ) {
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
        const response = await axios.post(
          `${appConfig.apiUrl}/user/refresh-token`,
          {},
          { withCredentials: true },
        );

        if (response.data?.errCode !== 0) {
          throw new Error(response.data?.errMessage || "Refresh token failed");
        }

        isRefreshing = false;
        processQueue(null);

        return axiosClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        // Logout user on any refresh failure (status 401/403/400 or custom thrown error)
        if (
          refreshError.response?.status === 401 ||
          refreshError.response?.status === 403 ||
          refreshError.response?.status === 400 ||
          !refreshError.response
        ) {
          store.dispatch(removeUser());
          store.dispatch(clearCart());
        }

        return Promise.reject(refreshError);
      }
    }

    if (error.response?.data?.errMessage) {
      error.errMessage = error.response.data.errMessage;
    }
    if (error.response?.data?.message) {
      error.serverMessage = error.response.data.message;
    }

    return Promise.reject(error);
  },
);

export default axiosClient;

