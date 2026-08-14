import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FiBell,
  FiPackage,
  FiInfo,
  FiTag,
  FiTrash2,
  FiCheck,
  FiExternalLink,
  FiShield,
  FiSend,
  FiX,
} from "react-icons/fi";
import {
  getNotificationsApi,
  markAsReadApi,
  markAllReadApi,
  deleteNotificationApi,
  sendBroadcastNotificationApi,
} from "../../api/notificationApi";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { appConfig } from "../../config/runtimeConfig";
import UnifiedSpinner from "../Loading/UnifiedSpinner";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "framer-motion";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // all, order, promotion, system, unread
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
    type: "system",
    link: "",
    target: "all",
  });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const dropdownRef = useRef(null);
  const user = useSelector((state) => state.user.user);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await getNotificationsApi(1, 15, activeFilter);
      if (res.errCode === 0) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
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
        socket.on("new_order", () => {
          fetchNotifications();
          toast.info("🔔 Bạn có đơn hàng mới từ khách hàng!");
        });
      }

      socket.on("order_status_updated", () => {
        fetchNotifications();
      });

      socket.on("notification", (data) => {
        fetchNotifications();
        if (data?.title) {
          toast.info(`🔔 ${data.title}`);
        }
      });
    }

    return () => {
      if (user) {
        socket.off("new_order");
        socket.off("order_status_updated");
        socket.off("notification");
      }
      socket.disconnect();
    };
  }, [user, activeFilter]);

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

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
      const res = await deleteNotificationApi(id);
      if (res?.errCode === 0) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
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

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) {
      return toast.warning("Vui lòng nhập tiêu đề và nội dung!");
    }
    setSendingBroadcast(true);
    try {
      const res = await sendBroadcastNotificationApi(broadcastForm);
      if (res.errCode === 0) {
        toast.success(res.message || "Đã phát thông báo thành công!");
        setShowAdminModal(false);
        setBroadcastForm({
          title: "",
          message: "",
          type: "system",
          link: "",
          target: "all",
        });
        fetchNotifications();
      } else {
        toast.error(res.errMessage || "Không thể gửi thông báo");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi gửi thông báo");
    } finally {
      setSendingBroadcast(false);
    }
  };

  if (!user) return null;

  const getTypeStyle = (type) => {
    switch (type) {
      case "order":
        return {
          bg: "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/40",
          icon: <FiPackage size={16} />,
          badge: "Đơn hàng",
        };
      case "promotion":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40",
          icon: <FiTag size={16} />,
          badge: "Ưu đãi",
        };
      case "security":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40",
          icon: <FiShield size={16} />,
          badge: "Bảo mật",
        };
      default:
        return {
          bg: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40",
          icon: <FiInfo size={16} />,
          badge: "Hệ thống",
        };
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative size-11 min-h-[44px] min-w-[44px] rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:border-primary/40 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-xs"
        title="Thông báo"
      >
        <FiBell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-950 shadow-md shadow-rose-500/30 animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Container */}
      <AnimatePresence>
        {showDropdown && (
          <Motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-dark-surface rounded-3xl shadow-2xl border border-slate-200/80 dark:border-dark-border z-[120] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                    Thông báo
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
                      {unreadCount} chưa đọc
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {user.role === "admin" && (
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowAdminModal(true);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                      title="Gửi thông báo toàn hệ thống"
                    >
                      <FiSend size={12} /> Phát TB
                    </button>
                  )}

                  {notifications.length > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-black text-primary dark:text-primary-light hover:underline uppercase tracking-wider cursor-pointer"
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "unread", label: "Chưa đọc" },
                  { id: "order", label: "Đơn hàng" },
                  { id: "promotion", label: "Ưu đãi" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                      activeFilter === f.id
                        ? "bg-primary text-white shadow-sm shadow-primary/20"
                        : "bg-white dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-surface border border-slate-200/60 dark:border-dark-border"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification List Body */}
            <div className="max-h-[380px] overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-dark-border">
              {loading && notifications.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
                  <UnifiedSpinner size="sm" variant="primary" />
                  <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
                    Đang tải thông báo...
                  </p>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((n) => {
                  const style = getTypeStyle(n.type);
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-4 flex gap-3.5 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-dark-bg/60 transition-all group relative ${
                        !n.isRead ? "bg-primary/5 dark:bg-primary/10" : ""
                      }`}
                    >
                      <div
                        className={`size-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${style.bg}`}
                      >
                        {style.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary">
                            {style.badge}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400">
                            {new Date(n.createdAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <h4
                          className={`text-xs font-black text-slate-900 dark:text-white leading-snug truncate ${
                            !n.isRead ? "" : "opacity-75 font-bold"
                          }`}
                        >
                          {n.title}
                        </h4>

                        <p className="text-[11px] font-medium text-slate-500 dark:text-dark-text-secondary line-clamp-2 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>

                        {n.link && (
                          <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-primary dark:text-primary-light group-hover:underline">
                            Chi tiết <FiExternalLink size={10} />
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col items-end justify-between shrink-0">
                        {!n.isRead ? (
                          <span className="size-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"></span>
                        ) : (
                          <div className="size-2.5" />
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleDeleteNotification(e, n.id)}
                          className="size-7 rounded-lg text-slate-300 dark:text-slate-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer"
                          title="Xóa thông báo"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center space-y-3">
                  <div className="size-14 bg-slate-50 dark:bg-dark-bg rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 mx-auto">
                    <FiBell size={28} />
                  </div>
                  <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Hộp thư trống
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-dark-text-secondary">
                    Bạn chưa có thông báo mới nào.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/40 text-center">
              <Link
                to="/notifications"
                onClick={() => setShowDropdown(false)}
                className="inline-flex items-center justify-center gap-1.5 text-[11px] font-black text-slate-600 dark:text-dark-text-secondary uppercase tracking-widest hover:text-primary dark:hover:text-primary-light transition-colors"
              >
                Xem tất cả thông báo <FiExternalLink size={12} />
              </Link>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Admin Broadcast Notification Modal (Centered via Portal) */}
      {showAdminModal &&
        createPortal(
          <AnimatePresence>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-md">
              <Motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-lg bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-dark-border my-auto"
              >
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100 dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold">
                      <FiSend />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        Phát thông báo hệ thống
                      </h3>
                      <p className="text-xs text-slate-400">
                        Gửi tin nhắn thông báo đến người dùng toàn cửa hàng
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="size-9 rounded-xl bg-slate-100 dark:bg-dark-bg text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <FiX size={18} />
                  </button>
                </div>

                <form onSubmit={handleSendBroadcast} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1.5">
                      Loại thông báo *
                    </label>
                    <select
                      value={broadcastForm.type}
                      onChange={(e) =>
                        setBroadcastForm({ ...broadcastForm, type: e.target.value })
                      }
                      className="w-full h-11 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl px-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10"
                    >
                      <option value="system">⚙️ Hệ thống (Bảo trì / Cập nhật)</option>
                      <option value="promotion">🏷️ Khuyến mãi (Voucher / Sale)</option>
                      <option value="order">📦 Đơn hàng</option>
                      <option value="security">🔒 Bảo mật</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1.5">
                      Tiêu đề thông báo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: 🎉 Siêu SALE 9.9 Khuyến Mãi Khủng!"
                      value={broadcastForm.title}
                      onChange={(e) =>
                        setBroadcastForm({ ...broadcastForm, title: e.target.value })
                      }
                      className="w-full h-11 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl px-4 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1.5">
                      Nội dung chi tiết *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Nhập thông điệp gửi tới khách hàng..."
                      value={broadcastForm.message}
                      onChange={(e) =>
                        setBroadcastForm({ ...broadcastForm, message: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl p-4 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary mb-1.5">
                      Đường dẫn liên kết (Link tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: /vouchers hoặc /orders"
                      value={broadcastForm.link}
                      onChange={(e) =>
                        setBroadcastForm({ ...broadcastForm, link: e.target.value })
                      }
                      className="w-full h-11 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl px-4 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-3 border-t border-slate-100 dark:border-dark-border">
                    <button
                      type="button"
                      onClick={() => setShowAdminModal(false)}
                      className="btn-modern-secondary text-xs"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      disabled={sendingBroadcast}
                      className="btn-modern-primary text-xs flex items-center gap-2"
                    >
                      {sendingBroadcast && <UnifiedSpinner size="xs" variant="white" />}
                      <FiSend /> Gửi Ngay Cho Tất Cả
                    </button>
                  </div>
                </form>
              </Motion.div>
            </div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

export default NotificationBell;
