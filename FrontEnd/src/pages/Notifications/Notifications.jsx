import React, { useState, useEffect, useCallback } from "react";
import {
  FiBell,
  FiPackage,
  FiInfo,
  FiCheck,
  FiArrowLeft,
  FiClock,
  FiTrash2,
  FiMoreVertical,
} from "react-icons/fi";
import {
  getNotificationsApi,
  markAsReadApi,
  markAllReadApi,
} from "../../api/notificationApi";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const Notifications = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(
    async (isLoadMore = false) => {
      if (!user) return;
      try {
        if (!isLoadMore) setLoading(true);
        const res = await getNotificationsApi(isLoadMore ? page + 1 : 1, 20);
        if (res.errCode === 0) {
          if (isLoadMore) {
            setNotifications((prev) => [...prev, ...res.data]);
            setPage((prev) => prev + 1);
          } else {
            setNotifications(res.data);
            setPage(1);
          }
          setHasMore(res.data.length === 20);
        }
      } catch (error) {
        console.error(error);
        toast.error("Lỗi khi tải thông báo");
      } finally {
        setLoading(false);
      }
    },
    [user, page],
  );

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await markAsReadApi(id);
      if (res.errCode === 0) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await markAllReadApi();
      if (res.errCode === 0) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        toast.success("Đã đánh dấu tất cả là đã đọc");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      handleMarkAsRead(n.id);
    }
    if (n.link) {
      navigate(n.link);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface-50 py-12">
      <div className="container-custom max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-surface-400 hover:text-primary transition-colors mb-4 font-bold text-[11px] uppercase tracking-widest"
            >
              <FiArrowLeft size={16} /> Quay lại
            </Link>
            <h1 className="text-3xl font-display font-bold text-surface-900 flex items-center gap-3">
              <FiBell className="text-primary" />
              Thông báo của bạn
            </h1>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-6 py-2.5 bg-white border border-surface-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-surface-600 hover:border-primary hover:text-primary transition-all shadow-sm flex items-center gap-2"
            >
              <FiCheck /> Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        <div className="bg-white rounded-[32px] border border-surface-200 shadow-soft overflow-hidden">
          {loading && notifications.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-surface-400 font-bold uppercase tracking-widest text-[10px]">
                Đang tải thông báo...
              </p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-surface-100">
              {notifications.map((n, index) => (
                <Motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-6 md:p-8 flex gap-4 md:gap-6 cursor-pointer hover:bg-surface-50 transition-all relative group ${!n.isRead ? "bg-primary/5" : ""}`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-sm ${
                      n.type === "order"
                        ? "bg-sky-100 text-sky-600"
                        : n.type === "promotion"
                          ? "bg-rose-100 text-rose-600"
                          : "bg-primary/10 text-primary"
                    }`}
                  >
                    {n.type === "order" ? <FiPackage /> : <FiInfo />}
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3
                        className={`text-base font-bold text-surface-900 leading-tight ${!n.isRead ? "" : "opacity-70"}`}
                      >
                        {n.title}
                      </h3>
                      {!n.isRead && (
                        <span className="w-2.5 h-2.5 rounded-full bg-brand flex-shrink-0 mt-1.5 shadow-sm shadow-brand/40"></span>
                      )}
                    </div>

                    <p
                      className={`text-sm text-surface-500 leading-relaxed mb-4 ${!n.isRead ? "font-medium" : ""}`}
                    >
                      {n.message}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-surface-400 uppercase tracking-widest">
                        <FiClock className="text-primary" />
                        {new Date(n.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        <span className="mx-1">•</span>
                        {new Date(n.createdAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>

                  {/* Mobile tap indicator or actions would go here */}
                </Motion.div>
              ))}

              {hasMore && (
                <div className="p-8 text-center bg-surface-50/30">
                  <button
                    onClick={() => fetchNotifications(true)}
                    disabled={loading}
                    className="px-10 py-3 bg-white border border-surface-200 rounded-2xl text-xs font-black uppercase tracking-widest text-surface-600 hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-50"
                  >
                    {loading ? "Đang tải..." : "Xem thêm thông báo"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-32 text-center">
              <div className="w-24 h-24 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiBell className="text-surface-200" size={48} />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-2">
                Hộp thư trống
              </h3>
              <p className="text-surface-500 font-medium">
                Bạn không có thông báo nào vào lúc này.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
