import React from "react";
import { Filter, Shield, RotateCcw, Activity } from "lucide-react";

const UserFilterToolbar = ({
  statusFilter,
  roleFilter,
  onStatusChange,
  onRoleChange,
  onResetFilters,
  onOpenGlobalAudit,
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-dark-card px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border">
        <Filter className="text-slate-400 size-3 shrink-0" />
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer dark:[color-scheme:dark] [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-dark-surface dark:[&>option]:text-slate-100"
          aria-label="Lọc theo trạng thái tài khoản"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="pending">Chờ kích hoạt OTP</option>
          <option value="suspended">Đã vô hiệu hóa</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-dark-card px-3 py-1.5 rounded-lg border border-slate-200 dark:border-dark-border">
        <Shield className="text-slate-400 size-3 shrink-0" />
        <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer dark:[color-scheme:dark] [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-dark-surface dark:[&>option]:text-slate-100"
          aria-label="Lọc theo vai trò"
        >
          <option value="all">Tất cả vai trò</option>
          <option value="customer">Khách hàng</option>
          <option value="admin">Quản trị viên</option>
        </select>
      </div>

      {(statusFilter !== "all" || roleFilter !== "all") && (
        <button
          type="button"
          onClick={onResetFilters}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          title="Đặt lại bộ lọc"
        >
          <RotateCcw className="size-3" />
          <span>Đặt lại</span>
        </button>
      )}

      <button
        type="button"
        onClick={onOpenGlobalAudit}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border hover:border-primary rounded-lg transition-all cursor-pointer shadow-xs"
        title="Xem toàn bộ nhật ký quản trị"
      >
        <Activity className="size-3.5 text-primary" />
        <span className="hidden md:inline">Nhật ký hệ thống</span>
      </button>
    </div>
  );
};

export default UserFilterToolbar;
