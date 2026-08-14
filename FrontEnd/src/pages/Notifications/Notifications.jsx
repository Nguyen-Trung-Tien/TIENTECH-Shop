import React, { useState, useEffect, useCallback } from "react";
import {
  FiBell,
  FiPackage,
  FiInfo,
  FiCheck,
  FiArrowLeft,
  FiClock,
  FiTrash2,
  FiTag,
  FiShield,
  FiExternalLink,
} from "react-icons/fi";
import {
  getNotificationsApi,
  markAsReadApi,
  markAllReadApi,
  deleteNotificationApi,
  clearAllNotificationsApi,
} from "../../api/notificationApi";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import UnifiedSpinner from "../../components/Loading/UnifiedSpinner";
import { ConfirmModal } from "../../components/UI/Modal";

const Notifications = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterTab, setFilterTab] = useState("all"); // all, order, promotion, system, unread
  const [showClearModal, setShowClearModal] = useState(false);

  const fetchNotifications = useCallback(
    async (isLoadMore = false) => {
      if (!user) return;
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        const nextPage = isLoadMore ? page + 1 : 1;
        const res = await getNotificationsApi(nextPage, 20, filterTab);
        if (res.errCode === 0) {
          if (isLoadMore) {
            setNotifications((prev) => [...prev, ...(res.data || [])]);
            setPage(nextPage);
          } else {
            setNotifications(res.data || []);
            setPage(1);
          }
          setHasMore((res.data || []).length === 20);
        }
      } catch (error) {
        console.error(error);
        toast.error("Lỗi khi tải thông báo");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user, page, filterTab]
  );

  useEffect(() => {
    fetchNotifications();
  }, [user, filterTab]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await markAsReadApi(id);
      if (res.errCode === 0) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSingle = async (e, id) => {
    e.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const res = await deleteNotificationApi(id);
      if (res?.errCode === 0) {
        toast.success("Đã xóa thông báo!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa thông báo");
    }
  };

  const handleClearAll = async () => {
    try {
      setNotifications([]);
      setShowClearModal(false);
      const res = await clearAllNotificationsApi();
      if (res?.errCode === 0) {
        toast.success("Đã xóa toàn bộ thông báo!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa thông báo");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      const res = await markAllReadApi();
      if (res?.errCode === 0) {
        toast.success("Đã đánh dấu tất cả là đã đọc");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi đánh dấu đã đọc");
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

  const getTypeBadge = (type) => {
    switch (type) {
      case "order":
        return {
          icon: <FiPackage />,
          label: "Đơn hàng",
          color: "bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/50",
        };
      case "promotion":
        return {
          icon: <FiTag />,
          label: "Khuyến mãi",
          color: "bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50",
        };
      case "security":
        return {
          icon: <FiShield />,
          label: "Bảo mật",
          color: "bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
        };
      default:
        return {
          icon: <FiInfo />,
          label: "Hệ thống",
          color: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg py-8 sm:py-12 transition-colors duration-300">
      <div className="container-custom max-w-4xl">
        {/* Navigation back & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-400 dark:text-dark-text-secondary hover:text-primary transition-colors mb-3 font-bold text-xs uppercase tracking-widest"
            >
              <FiArrowLeft size={16} /> Quay lại cửa hàng
            </Link>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <FiBell size={24} />
              </div>
              Thông báo của bạn
            </h1>
          </div>

          {notifications.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllRead}
                className="px-4 py-2.5 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-dark-text-secondary hover:border-primary hover:text-primary transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <FiCheck size={14} /> Đánh dấu đã đọc
              </button>
              <button
                onClick={() => setShowClearModal(true)}
                className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl text-[11px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <FiTrash2 size={14} /> Xóa tất cả
              </button>
            </div>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 mb-6 bg-white dark:bg-dark-surface p-2 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-sm overflow-x-auto scrollbar-hide">
          {[
            { id: "all", label: "Tất cả" },
            { id: "unread", label: "Chưa đọc" },
            { id: "order", label: "Đơn hàng" },
            { id: "promotion", label: "Khuyến mãi" },
            { id: "system", label: "Hệ thống" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wider shrink-0 cursor-pointer ${
                filterTab === tab.id
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-500 dark:text-dark-text-secondary hover:bg-slate-50 dark:hover:bg-dark-bg"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications Card List */}
        <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200/80 dark:border-dark-border shadow-soft overflow-hidden">
          {loading && notifications.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
              <UnifiedSpinner size="lg" variant="primary" />
              <p className="text-slate-400 dark:text-dark-text-secondary font-bold uppercase tracking-widest text-[10px]">
                Đang tải danh sách thông báo...
              </p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-dark-border">
              {notifications.map((n, index) => {
                const badge = getTypeBadge(n.type);
                return (
                  <Motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-6 md:p-8 flex gap-4 md:gap-6 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-dark-bg/50 transition-all relative group ${
                      !n.isRead ? "bg-primary/5 dark:bg-primary/10" : ""
                    }`}
                  >
                    <div
                      className={`size-14 rounded-2xl border flex items-center justify-center shrink-0 text-xl shadow-xs ${badge.color}`}
                    >
                      {badge.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                          {!n.isRead && (
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 shadow-xs shadow-rose-500/50"></span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteSingle(e, n.id)}
                          className="size-8 rounded-xl text-slate-300 dark:text-slate-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer"
                          title="Xóa thông báo này"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>

                      <h3
                        className={`text-base font-black text-slate-900 dark:text-white leading-snug mb-1 ${
                          !n.isRead ? "" : "opacity-75 font-semibold"
                        }`}
                      >
                        {n.title}
                      </h3>

                      <p
                        className={`text-xs text-slate-600 dark:text-dark-text-secondary leading-relaxed mb-4 ${
                          !n.isRead ? "font-medium" : ""
                        }`}
                      >
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
                          <FiClock className="text-primary" />
                          {new Date(n.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          <span className="mx-1">•</span>
                          {new Date(n.createdAt).toLocaleDateString("vi-VN")}
                        </div>

                        {n.link && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-primary-light group-hover:underline">
                            Xem chi tiết <FiExternalLink size={13} />
                          </span>
                        )}
                      </div>
                    </div>
                  </Motion.div>
                );
              })}

              {hasMore && (
                <div className="p-8 text-center bg-slate-50/40 dark:bg-dark-bg/30">
                  <button
                    onClick={() => fetchNotifications(true)}
                    disabled={loading || loadingMore}
                    className="inline-flex items-center gap-3 min-h-[44px] px-10 py-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-dark-text-secondary hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-50 active:scale-95 cursor-pointer"
                  >
                    {loadingMore ? (
                      <>
                        <UnifiedSpinner size="xs" variant="primary" />
                        <span>Đang tải thêm...</span>
                      </>
                    ) : (
                      "Xem thêm thông báo"
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-24 text-center space-y-4">
              <div className="size-20 bg-slate-50 dark:bg-dark-bg rounded-3xl flex items-center justify-center mx-auto text-slate-300 dark:text-slate-600 border border-slate-100 dark:border-dark-border">
                <FiBell size={40} />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Không có thông báo nào
              </h3>
              <p className="text-xs text-slate-500 dark:text-dark-text-secondary">
                Không tìm thấy thông báo phù hợp trong mục này.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearAll}
        title="Xóa toàn bộ thông báo?"
        message="Hành động này sẽ xóa tất cả thông báo trong hộp thư của bạn. Bạn có chắc chắn muốn xóa?"
        confirmText="Xóa tất cả"
        variant="danger"
        icon={FiTrash2}
        iconClassName="bg-rose-50 dark:bg-rose-950/40 text-rose-500 border-rose-100 dark:border-rose-900/40"
      />
    </div>
  );
};

export default Notifications;
