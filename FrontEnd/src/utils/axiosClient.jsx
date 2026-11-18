import axios from "axios";
import { appConfig } from "../config/runtimeConfig";
import { removeUser } from "../redux/userSlice";
import { clearCart } from "../redux/cartSlice";
import { store } from "../redux/store";

const axiosClient = axios.create({
  baseURL: appConfig.apiUrl,
  withCredentials: true,
});

const authChannel =
  typeof window !== "undefined" && typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("tientech_auth_channel")
    : null;

let isRefreshing = false;
let isCrossTabRefreshing = false;
let crossTabRefreshTimeout = null;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

if (authChannel) {
  authChannel.onmessage = (event) => {
    const { type, reason } = event.data || {};
    if (type === "LOGOUT" || type === "ACCOUNT_LOCKED") {
      isCrossTabRefreshing = false;
      if (crossTabRefreshTimeout) clearTimeout(crossTabRefreshTimeout);
      processQueue(new Error("Session terminated"));
      store.dispatch(removeUser());
      store.dispatch(clearCart());
      if (type === "ACCOUNT_LOCKED" && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tiêntech:account_locked", {
            detail: { reason },
          })
        );
      }
    } else if (type === "REFRESH_START") {
      isCrossTabRefreshing = true;
      if (crossTabRefreshTimeout) clearTimeout(crossTabRefreshTimeout);
      crossTabRefreshTimeout = setTimeout(() => {
        isCrossTabRefreshing = false;
        processQueue(new Error("Cross-tab refresh timeout"));
      }, 8000);
    } else if (type === "REFRESH_DONE") {
      isCrossTabRefreshing = false;
      if (crossTabRefreshTimeout) clearTimeout(crossTabRefreshTimeout);
      processQueue(null);
    } else if (type === "REFRESH_FAILED") {
      isCrossTabRefreshing = false;
      if (crossTabRefreshTimeout) clearTimeout(crossTabRefreshTimeout);
      processQueue(new Error("Cross-tab refresh failed"));
    }
  };
}

const broadcastAuthEvent = (type, payload = {}) => {
  try {
    authChannel?.postMessage({ type, ...payload });
  } catch {
    // Ignore BroadcastChannel errors
  }
};

const getXsrfToken = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="));
  return match ? decodeURIComponent(match.split("=")[1]) : null;
};

axiosClient.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    config.headers["Cache-Control"] = "no-cache";
    config.headers["Pragma"] = "no-cache";
    const method = (config.method || "get").toLowerCase();
    if (["post", "put", "patch", "delete"].includes(method)) {
      const xsrfToken = getXsrfToken();
      if (xsrfToken) {
        config.headers["X-XSRF-TOKEN"] = xsrfToken;
      }
    }
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
      broadcastAuthEvent("ACCOUNT_LOCKED", { reason });
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
      if (isRefreshing || isCrossTabRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      broadcastAuthEvent("REFRESH_START");

      try {
        const xsrfToken = getXsrfToken();
        const response = await axios.post(
          `${appConfig.apiUrl}/user/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {},
          },
        );

        if (response.data?.errCode !== 0) {
          throw new Error(response.data?.errMessage || "Refresh token failed");
        }

        isRefreshing = false;
        broadcastAuthEvent("REFRESH_DONE");
        processQueue(null);

        return axiosClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        broadcastAuthEvent("REFRESH_FAILED");
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
          broadcastAuthEvent("LOGOUT");
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

