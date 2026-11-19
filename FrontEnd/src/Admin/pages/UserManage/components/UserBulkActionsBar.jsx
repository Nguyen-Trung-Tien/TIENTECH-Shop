import React from "react";
import { CheckCircle2, Ban, X } from "lucide-react";

const UserBulkActionsBar = ({ selectedCount, onOpenBulkModal, onClearSelection }) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl transition-all animate-fadeIn">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
        <span className="size-2 rounded-full bg-primary animate-ping" />
        <span>
          Đã chọn <strong className="text-primary font-black">{selectedCount}</strong> tài khoản
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onOpenBulkModal("active")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <CheckCircle2 className="size-3.5" />
          <span>Kích hoạt hàng loạt</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenBulkModal("suspended")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Ban className="size-3.5" />
          <span>Khóa hàng loạt</span>
        </button>

        <button
          type="button"
          onClick={onClearSelection}
          className="size-8 rounded-lg bg-slate-200/80 dark:bg-dark-card border border-transparent dark:border-dark-border text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Bỏ chọn tất cả"
          aria-label="Bỏ chọn tất cả"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
};

export default UserBulkActionsBar;
