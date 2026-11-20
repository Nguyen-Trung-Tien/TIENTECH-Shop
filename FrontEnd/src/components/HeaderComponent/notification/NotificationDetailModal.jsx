import React from "react";
import { Package, Tag, Shield, Info, ExternalLink } from "lucide-react";
import { Modal, Button } from "../../UI";
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

  return (
    <Modal
      isOpen={Boolean(notification)}
      onClose={onClose}
      size="lg"
      title={notification.title}
      subtitle={
        notification.createdAt
          ? new Date(notification.createdAt).toLocaleString("vi-VN")
          : "Vừa xong"
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border">
          <div
            className={`size-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs ${meta.bg}`}
          >
            <TypeIcon iconType={meta.iconType} />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white dark:bg-dark-surface text-slate-600 dark:text-dark-text-secondary border border-slate-200/60 dark:border-dark-border">
              {meta.badge}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-dark-bg p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-dark-border max-h-72 overflow-y-auto custom-scrollbar">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap min-w-0 flex-1 select-text">
            {notification.message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {notification.link && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<ExternalLink className="size-3.5" />}
              onClick={() => {
                const link = notification.link;
                onClose();
                onNavigate(link);
              }}
            >
              Đi đến trang liên kết
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationDetailModal;
