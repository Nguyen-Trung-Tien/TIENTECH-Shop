import React, { useState, useEffect, useRef } from "react";
import { FiBell, FiPackage, FiInfo, FiCheck } from "react-icons/fi";
import { getNotificationsApi, markAsReadApi, markAllReadApi } from "../../api/notificationApi";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const user = useSelector((state) => state.user.user);
  
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await getNotificationsApi(1, 10);
      if (res.errCode === 0) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Socket.io integration
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:8080");
    
    if (user) {
      socket.emit("join", `user_${user.id}`);
      if (user.role === 'admin') {
        socket.emit("join_admin");
        socket.on("new_order", () => fetchNotifications());
      } 
      
      socket.on("order_status_updated", () => fetchNotifications());
      socket.on("notification", () => fetchNotifications());
    }

    return () => socket.disconnect();
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
      await markAllReadApi();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-surface-500 hover:text-primary dark:text-dark-text-secondary dark:hover:text-brand transition-colors rounded-full hover:bg-surface-100 dark:hover:bg-dark-surface"
      >
        <FiBell size={22} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-brand text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-dark-bg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-dark-surface rounded-2xl shadow-xl-soft border border-surface-100 dark:border-dark-border z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-surface-50 dark:border-dark-border flex justify-between items-center bg-surface-50/50 dark:bg-dark-bg/20">
            <h3 className="text-sm font-black text-surface-900 dark:text-white uppercase tracking-widest">Thông báo</h3>
            <button 
              onClick={handleMarkAllRead}
              className="text-[10px] font-bold text-primary dark:text-brand hover:underline"
            >
              Đánh dấu tất cả đã đọc
            </button>
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 border-b border-surface-50 dark:border-dark-border flex gap-3 cursor-pointer hover:bg-surface-50 dark:hover:bg-dark-bg transition-colors ${!n.isRead ? "bg-primary/5 dark:bg-brand/5" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.type === 'order' ? "bg-sky-100 text-sky-600" : "bg-primary/10 text-primary"}`}>
                    {n.type === 'order' ? <FiPackage /> : <FiInfo />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className={`text-xs font-bold text-surface-900 dark:text-white mb-1 ${!n.isRead ? "" : "opacity-70"}`}>{n.title}</p>
                    <p className="text-[11px] text-surface-500 dark:text-dark-text-secondary line-clamp-2 leading-relaxed">{n.message}</p>
                    <p className="text-[9px] text-surface-400 mt-2 font-medium uppercase tracking-tighter">
                      {new Date(n.createdAt).toLocaleTimeString("vi-VN")} - {new Date(n.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-brand mt-2 flex-shrink-0"></div>}
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <FiBell className="mx-auto text-surface-200 dark:text-dark-border mb-3" size={32} />
                <p className="text-xs text-surface-400 font-bold uppercase tracking-widest">Không có thông báo nào</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <Link 
              to="/profile" 
              className="block p-3 text-center text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] hover:text-primary dark:hover:text-brand border-t border-surface-50 dark:border-dark-border transition-colors"
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
