import React from "react";
import { Link } from "react-router-dom";
import { m as Motion, AnimatePresence } from "framer-motion";
import { Bell, Volume2, VolumeX, Send, ExternalLink } from "lucide-react";
import UnifiedSpinner from "../../Loading/UnifiedSpinner";
import NotificationItemRow from "./NotificationItemRow";
import { NOTIFICATION_FILTERS } from "./notificationBellMeta";

const NotificationDropdownPanel = ({
  showDropdown,
  unreadCount,
  soundEnabled,
  onToggleSound,
  userRole,
  onOpenAdminBroadcast,
  notifications,
  loading,
  activeFilter,
  onChangeFilter,
  onMarkAllRead,
  onCloseDropdown,
  copiedCode,
  onSelectNotification,
  onCopyVoucher,
  onNavigateLink,
  onDeleteNotification,
}) => {
  return (
    <AnimatePresence>
      {showDropdown && (
        <Motion.div
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-96 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-dark-surface rounded-3xl shadow-2xl border border-slate-200/80 dark:border-dark-border z-[120] overflow-hidden"
        >
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
                <button
                  type="button"
                  onClick={onToggleSound}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors cursor-pointer"
                  title={
                    soundEnabled ? "Tắt âm thanh thông báo" : "Bật âm thanh thông báo"
                  }
                  aria-label={
                    soundEnabled ? "Tắt âm thanh thông báo" : "Bật âm thanh thông báo"
                  }
                >
                  {soundEnabled ? (
                    <Volume2 className="size-3.5 text-primary" />
                  ) : (
                    <VolumeX className="size-3.5" />
                  )}
                </button>

                {["admin", "root"].includes(userRole) && (
                  <button
                    type="button"
                    onClick={onOpenAdminBroadcast}
                    className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                    title="Gửi thông báo toàn hệ thống"
                  >
                    <Send className="size-3" /> Phát TB
                  </button>
                )}

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllRead}
                    className="text-[10px] font-black text-primary dark:text-primary-light hover:underline uppercase tracking-wider cursor-pointer"
                  >
                    Đọc tất cả
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {NOTIFICATION_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onChangeFilter(f.id)}
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

          <div className="max-h-[380px] overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-dark-border">
            {loading && notifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
                <UnifiedSpinner size="sm" variant="primary" />
                <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest">
                  Đang tải thông báo...
                </p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((n) => (
                <NotificationItemRow
                  key={n.id}
                  notification={n}
                  copiedCode={copiedCode}
                  onSelect={onSelectNotification}
                  onCopyVoucher={onCopyVoucher}
                  onNavigateLink={onNavigateLink}
                  onDelete={onDeleteNotification}
                />
              ))
            ) : (
              <div className="p-12 text-center space-y-3">
                <div className="size-14 bg-slate-50 dark:bg-dark-bg rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 mx-auto">
                  <Bell className="size-7" />
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

          <div className="p-3 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/40 text-center">
            <Link
              to="/notifications"
              onClick={onCloseDropdown}
              className="inline-flex items-center justify-center gap-1.5 text-[11px] font-black text-slate-600 dark:text-dark-text-secondary uppercase tracking-widest hover:text-primary dark:hover:text-primary-light transition-colors"
            >
              Xem tất cả thông báo <ExternalLink className="size-3" />
            </Link>
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdownPanel;
