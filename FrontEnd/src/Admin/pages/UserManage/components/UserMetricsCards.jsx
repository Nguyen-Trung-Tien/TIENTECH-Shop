import React from "react";
import { Users, UserCheck, AlertCircle, UserX, Shield } from "lucide-react";

const UserMetricsCards = ({ metrics, loadingMetrics, totalItems }) => {
  const cards = [
    {
      label: "Tổng user",
      value: metrics?.totalUsers ?? totalItems,
      icon: Users,
      border: "border-slate-200 dark:border-dark-border",
      labelClass: "text-slate-400",
      iconWrap: "bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-dark-text-secondary",
      valueClass: "text-slate-900 dark:text-white",
    },
    {
      label: "Hoạt động",
      value: metrics?.activeUsers ?? 0,
      icon: UserCheck,
      border: "border-emerald-100 dark:border-emerald-950/40",
      labelClass: "text-emerald-600 dark:text-emerald-400",
      iconWrap: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400",
      valueClass: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Chờ OTP",
      value: metrics?.pendingUsers ?? 0,
      icon: AlertCircle,
      border: "border-amber-100 dark:border-amber-950/40",
      labelClass: "text-amber-600 dark:text-amber-400",
      iconWrap: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400",
      valueClass: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Đã khóa",
      value: metrics?.suspendedUsers ?? 0,
      icon: UserX,
      border: "border-rose-100 dark:border-rose-950/40",
      labelClass: "text-rose-600 dark:text-rose-400",
      iconWrap: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400",
      valueClass: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Quản trị",
      value: metrics?.adminUsers ?? 0,
      icon: Shield,
      border: "border-purple-100 dark:border-purple-950/40 col-span-2 sm:col-span-1",
      labelClass: "text-purple-600 dark:text-purple-400",
      iconWrap: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400",
      valueClass: "text-purple-600 dark:text-purple-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-2">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`bg-white dark:bg-dark-surface p-4 rounded-xl border ${card.border} shadow-xs min-w-0`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${card.labelClass}`}>
                {card.label}
              </span>
              <div className={`size-7 rounded-lg flex items-center justify-center ${card.iconWrap}`}>
                <Icon className="size-3.5" aria-hidden="true" />
              </div>
            </div>
            <p className={`text-xl sm:text-2xl font-black mt-2 ${card.valueClass}`}>
              {loadingMetrics ? "..." : card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default UserMetricsCards;
