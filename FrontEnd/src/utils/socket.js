import { io } from "socket.io-client";
import { appConfig } from "../config/runtimeConfig";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(appConfig.socketUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const initUserSocket = (user) => {
  const s = getSocket();
  if (user?.id) {
    s.emit("join", `user_${user.id}`);
    if (user.role === "admin" || user.role === "root") {
      s.emit("join_admin");
    }
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

