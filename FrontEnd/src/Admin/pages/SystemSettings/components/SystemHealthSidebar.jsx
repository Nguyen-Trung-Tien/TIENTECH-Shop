import React from "react";
import { Cpu, RefreshCw, Database, Zap, Trash2, Moon, Sun } from "lucide-react";

const SystemHealthSidebar = ({
  healthData,
  healthLoading,
  onRefreshHealth,
  flushingCache,
  onOpenFlushModal,
  isDark,
  onSetTheme,
}) => {
  return (
    <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
      <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Cpu className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Sức Khỏe Hệ Thống
              </h3>
              <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary">
                Live Server Diagnostics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRefreshHealth}
            disabled={healthLoading}
            aria-label="Làm mới thông số sức khỏe hệ thống"
            className="size-8 rounded-lg bg-slate-100 dark:bg-dark-bg hover:bg-slate-200 dark:hover:bg-dark-border text-slate-600 dark:text-dark-text-secondary flex items-center justify-center transition-all cursor-pointer"
          >
            <RefreshCw
              className={`size-3.5 ${healthLoading ? "animate-spin text-primary" : ""}`}
            />
          </button>
        </div>

        {healthData && (
          <div className="space-y-2.5 pt-1 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-dark-border">
              <span className="font-bold text-slate-500 dark:text-dark-text-secondary flex items-center gap-1.5">
                <Database className="size-3.5 text-blue-500" /> MySQL Latency
              </span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                {healthData.database?.latencyMs} ms
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-dark-border">
              <span className="font-bold text-slate-500 dark:text-dark-text-secondary flex items-center gap-1.5">
                <Zap className="size-3.5 text-amber-500" /> Redis Cache
              </span>
              <span
                className={`font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                  healthData.redis?.connected
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                }`}
              >
                {healthData.redis?.connected ? "Connected" : "Offline"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-dark-border">
              <span className="font-bold text-slate-500 dark:text-dark-text-secondary">
                Keys Trong Cache
              </span>
              <span className="font-mono font-black text-slate-900 dark:text-white">
                {healthData.redis?.totalKeys || 0} keys
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-dark-border">
              <span className="font-bold text-slate-500 dark:text-dark-text-secondary">
                RAM Server
              </span>
              <span className="font-mono font-black text-slate-900 dark:text-white">
                {healthData.server?.memory?.used} / {healthData.server?.memory?.total}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="font-bold text-slate-500 dark:text-dark-text-secondary">
                Thời Gian Hoạt Động
              </span>
              <span className="font-mono font-black text-primary">
                {Math.floor((healthData.server?.uptime || 0) / 60)} phút
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-2xs space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Trash2 className="size-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Quản Lý Bộ Nhớ Cache
            </h3>
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
              Flush Redis In-Memory DB
            </p>
          </div>
        </div>
        <p className="text-xs font-medium text-slate-600 dark:text-dark-text-secondary leading-relaxed">
          Xóa toàn bộ cache tạm (sản phẩm hot, danh mục, cài đặt) để ép buộc nạp dữ liệu mới nhất từ MySQL Database.
        </p>
        <button
          type="button"
          onClick={onOpenFlushModal}
          disabled={flushingCache}
          className="w-full h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Trash2 className="size-3.5" />
          <span>Xóa Sạch Cache Redis</span>
        </button>
      </div>

      <div className="bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border rounded-2xl p-5 shadow-2xs space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            {isDark ? <Moon className="size-4.5" /> : <Sun className="size-4.5" />}
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Chế Độ Giao Diện
            </h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary">
              UI Appearance Mode
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          <button
            type="button"
            onClick={() => onSetTheme("light")}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
              !isDark
                ? "border-primary bg-primary/10 text-primary font-black shadow-2xs"
                : "border-slate-200/80 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary font-bold"
            }`}
          >
            <Sun className="size-4" />
            <span className="text-xs">Sáng</span>
          </button>
          <button
            type="button"
            onClick={() => onSetTheme("dark")}
            className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isDark
                ? "border-primary bg-primary/15 text-primary font-black shadow-2xs"
                : "border-slate-200/80 dark:border-dark-border bg-slate-50 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary font-bold"
            }`}
          >
            <Moon className="size-4" />
            <span className="text-xs">Tối</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthSidebar;
