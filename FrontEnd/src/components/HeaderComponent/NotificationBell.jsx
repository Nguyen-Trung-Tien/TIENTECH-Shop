import React, { useState, useEffect, useRef } from "react";
import { FiBell, FiPackage, FiInfo } from "react-icons/fi";
import {
  getNotificationsApi,
  markAsReadApi,
  markAllReadApi,
} from "../../api/notificationApi";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { appConfig } from "../../config/runtimeConfig";
import UnifiedSpinner from "../Loading/UnifiedSpinner";
import { toast } from "react-toastify";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const user = useSelector((state) => state.user.user);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await getNotificationsApi(1, 10);
      if (res.errCode === 0) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = io(appConfig.socketUrl);

    if (user) {
      socket.emit("join", `user_${user.id}`);
      if (user.role === "admin") {
        socket.emit("join_admin");
        socket.on("new_order", fetchNotifications);
      }

      socket.on("order_status_updated", fetchNotifications);
      socket.on("notification", fetchNotifications);
    }

    return () => {
      if (user) {
        socket.off("new_order", fetchNotifications);
        socket.off("order_status_updated", fetchNotifications);
        socket.off("notification", fetchNotifications);
      }
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      try {
        await markAsReadApi(n.id);
        fetchNotifications();
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    }
    setShowDropdown(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      const res = await markAllReadApi();
      if (res?.errCode === 0) {
        toast.success("Đã đánh dấu tất cả là đã đọc!");
      }
      fetchNotifications();
    } catch (err) {
      console.error("Error marking all read:", err);
      toast.error("Lỗi khi đánh dấu đã đọc");
    }
  };

  if (!user) return null;

  const handleNotificationKeyDown = (event, notification) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNotificationClick(notification);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative size-11 min-h-[44px] min-w-[44px] rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500/30 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
        title="Thông báo"
      >
        <FiBell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950 shadow-md shadow-rose-500/30">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-dark-surface rounded-2xl shadow-xl-soft border border-surface-100 dark:border-dark-border z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-surface-50 dark:border-dark-border flex justify-between items-center bg-surface-50/50 dark:bg-dark-bg/20">
            <h3 className="text-sm font-black text-surface-900 dark:text-white uppercase tracking-widest">
              Thông báo
            </h3>
            <button
              onClick={handleMarkAllRead}
              className="text-[10px] font-bold text-primary dark:text-brand hover:underline"
            >
              Đánh dấu tất cả đã đọc
            </button>
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                <UnifiedSpinner size="sm" variant="primary" />
                <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest">
                  Đang tải thông báo...
                </p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  onKeyDown={(event) => handleNotificationKeyDown(event, n)}
                  role="button"
                  tabIndex={0}
                  className={`p-4 border-b border-surface-50 dark:border-dark-border flex gap-3 cursor-pointer hover:bg-surface-50 dark:hover:bg-dark-bg transition-colors ${!n.isRead ? "bg-primary/5 dark:bg-brand/5" : ""}`}
                >
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === "order" ? "bg-sky-100 text-sky-600" : "bg-primary/10 text-primary"}`}
                  >
                    {n.type === "order" ? <FiPackage /> : <FiInfo />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p
                      className={`text-xs font-bold text-surface-900 dark:text-white mb-1 ${!n.isRead ? "" : "opacity-70"}`}
                    >
                      {n.title}
                    </p>
                    <p className="text-[11px] text-surface-500 dark:text-dark-text-secondary line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[9px] text-surface-400 mt-2 font-medium uppercase tracking-tighter">
                      {new Date(n.createdAt).toLocaleTimeString("vi-VN")} -{" "}
                      {new Date(n.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  {!n.isRead && (
                    <div className="size-2 rounded-full bg-brand mt-2 flex-shrink-0"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <FiBell
                  className="mx-auto text-surface-200 dark:text-dark-border mb-3"
                  size={32}
                />
                <p className="text-xs text-surface-400 font-bold uppercase tracking-widest">
                  Không có thông báo nào
                </p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <Link
              to="/notifications"
              onClick={() => setShowDropdown(false)}
              className="block p-3.5 text-center text-[10px] font-black text-slate-500 dark:text-dark-text-secondary uppercase tracking-[0.2em] hover:text-primary dark:hover:text-brand border-t border-surface-50 dark:border-dark-border transition-colors hover:bg-slate-50 dark:hover:bg-dark-bg"
            >
              Xem tất cả thông báo
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
