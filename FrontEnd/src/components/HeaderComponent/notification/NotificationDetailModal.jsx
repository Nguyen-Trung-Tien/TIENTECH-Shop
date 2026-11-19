import React from "react";
import { createPortal } from "react-dom";
import { m as Motion, AnimatePresence } from "framer-motion";
import { Package, Tag, Shield, Info, X, ExternalLink } from "lucide-react";
import { getNotificationTypeMeta } from "./notificationBellMeta";

const TypeIcon = ({ iconType }) => {
  switch (iconType) {
    case "order":
      return <Package className="size-4.5" />;
    case "promotion":
      return <Tag className="size-4.5" />;
    case "security":
      return <Shield className="size-4.5" />;
    default:
      return <Info className="size-4.5" />;
  }
};

const NotificationDetailModal = ({ notification, onClose, onNavigate }) => {
  if (!notification) return null;
  const meta = getNotificationTypeMeta(notification.type);

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-md">
        <Motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-detail-title"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white dark:bg-dark-surface rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-dark-border my-auto overflow-hidden"
        >
          <div className="flex items-start justify-between pb-4 mb-5 border-b border-slate-100 dark:border-dark-border gap-4 min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className={`size-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${meta.bg}`}
              >
                <TypeIcon iconType={meta.iconType} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary">
                  {meta.badge}
                </span>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  {notification.createdAt
                    ? new Date(notification.createdAt).toLocaleString("vi-VN")
                    : "Vừa xong"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng chi tiết thông báo"
              className="size-9 rounded-xl bg-slate-100 dark:bg-dark-bg text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Đóng"
            >
              <X className="size-4.5" />
            </button>
          </div>

          <h3
            id="notification-detail-title"
            className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-3 break-words [overflow-wrap:anywhere] min-w-0"
          >
            {notification.title}
          </h3>

          <div className="bg-slate-50 dark:bg-dark-bg p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-dark-border max-h-72 overflow-y-auto custom-scrollbar mb-6">
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap min-w-0 flex-1 select-text">
              {notification.message}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {notification.link && (
              <button
                type="button"
                onClick={() => {
                  const link = notification.link;
                  onClose();
                  onNavigate(link);
                }}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-primary/20"
              >
                Đi đến trang liên kết <ExternalLink className="size-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 dark:bg-dark-bg text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
};

export default NotificationDetailModal;
