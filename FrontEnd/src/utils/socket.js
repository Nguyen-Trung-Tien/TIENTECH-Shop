import { io } from "socket.io-client";
import { appConfig } from "../config/runtimeConfig";

let socket = null;
let currentUser = null;

const joinUserRooms = (s, user) => {
  if (!s || !user?.id) return;
  s.emit("join", `user_${user.id}`);
  if (user.role === "admin" || user.role === "root") {
    s.emit("join_admin");
  }
};

export const getSocket = () => {
  if (!socket) {
    socket = io(appConfig.socketUrl, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      if (currentUser?.id) {
        joinUserRooms(socket, currentUser);
      }
    });
  }
  return socket;
};

export const initUserSocket = (user) => {
  const prevUserId = currentUser?.id;
  currentUser = user || null;

  // If socket was connected as guest before login, reconnect so handshake authenticates
  if (socket && user?.id && !prevUserId && socket.connected) {
    socket.disconnect().connect();
  }

  const s = getSocket();
  if (user?.id && s.connected) {
    joinUserRooms(s, user);
  }
  return s;
};

export const disconnectSocket = () => {
  currentUser = null;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

