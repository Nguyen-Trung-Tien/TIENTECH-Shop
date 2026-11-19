import React from "react";
import { CheckCircle2, Ban, Clock, Edit2, Trash2 } from "lucide-react";

const UserActionButtons = ({
  item,
  currentUserId,
  onOpenStatusModal,
  onOpenAuditModal,
  onEdit,
  onDelete,
}) => {
  const isSelf = currentUserId === item.id;
  const isCurrentlyActive = item.isActive;

  return (
    <div className="flex items-center justify-end gap-1.5 flex-wrap">
      {!isCurrentlyActive ? (
        <button
          type="button"
          title="Kích hoạt tài khoản"
          onClick={() => onOpenStatusModal(item, "active")}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/40 rounded-md transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <CheckCircle2 className="size-3.5" />
          <span className="hidden sm:inline">Kích hoạt</span>
        </button>
      ) : (
        <button
          type="button"
          title={isSelf ? "Không thể khóa tài khoản của chính mình" : "Vô hiệu hóa tài khoản"}
          disabled={isSelf}
          onClick={() => onOpenStatusModal(item, "suspended")}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 rounded-md transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
        >
          <Ban className="size-3.5" />
          <span className="hidden sm:inline">Khóa</span>
        </button>
      )}

      <button
        type="button"
        title="Nhật ký kích hoạt"
        aria-label={`Xem nhật ký kích hoạt của ${item.username}`}
        onClick={() => onOpenAuditModal(item)}
        className="size-8 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-md hover:border-primary transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-xs"
      >
        <Clock className="size-3.5" />
      </button>

      <button
        type="button"
        title="Chỉnh sửa thông tin"
        aria-label={`Chỉnh sửa thông tin ${item.username}`}
        onClick={() => onEdit(item)}
        className="size-8 text-primary dark:text-blue-400 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-md hover:border-primary transition-all cursor-pointer flex items-center justify-center active:scale-95 shadow-xs"
      >
        <Edit2 className="size-3.5" />
      </button>

      <button
        type="button"
        title={isSelf ? "Không thể tự xóa chính mình" : "Xóa tài khoản"}
        aria-label={`Xóa tài khoản ${item.username}`}
        disabled={isSelf}
        onClick={() => onDelete(item)}
        className="size-8 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-md hover:border-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer flex items-center justify-center active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
};

export default UserActionButtons;
