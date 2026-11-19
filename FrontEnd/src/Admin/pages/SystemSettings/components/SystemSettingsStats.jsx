import React from "react";
import { SlidersHorizontal, Database, Zap, Activity } from "lucide-react";

const SystemSettingsStats = ({ settingsCount, healthData, isMaintenanceMode }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
      <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-2xs flex items-center gap-3.5 min-w-0">
        <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <SlidersHorizontal className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider truncate">
            Tổng Cấu Hình
          </p>
          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">
            {settingsCount} tham số
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-2xs flex items-center gap-3.5 min-w-0">
        <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Database className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider truncate">
            Độ Trễ Database
          </p>
          <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono truncate">
            {healthData?.database?.latencyMs ?? 0} ms
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-2xs flex items-center gap-3.5 min-w-0">
        <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Zap className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider truncate">
            Redis Cache
          </p>
          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5 truncate">
            {healthData?.redis?.connected ? "Connected" : "Direct DB"}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-2xs flex items-center gap-3.5 min-w-0">
        <div
          className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
            isMaintenanceMode
              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          <Activity className="size-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider truncate">
            Trạng Thái Sàn
          </p>
          <p
            className={`text-base sm:text-lg font-black mt-0.5 truncate ${
              isMaintenanceMode
                ? "text-rose-600 dark:text-rose-400"
                : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isMaintenanceMode ? "Đang Bảo Trì" : "Hoạt Động 24/7"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsStats;
