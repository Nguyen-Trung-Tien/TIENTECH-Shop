import React from "react";
import { ShoppingBag, Clock, Truck, CheckCircle2 } from "lucide-react";

const OrderStatsHeader = ({ summaryStats }) => {
  const cards = [
    {
      label: "Tổng số trang",
      value: summaryStats.total,
      icon: ShoppingBag,
      iconClass: "bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-slate-300",
      valueClass: "text-slate-900 dark:text-white",
    },
    {
      label: "Chờ xử lý",
      value: summaryStats.pending,
      icon: Clock,
      iconClass: "bg-amber-50 dark:bg-amber-950/40 text-amber-500",
      valueClass: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Đang xử lý/Giao",
      value: summaryStats.shipping,
      icon: Truck,
      iconClass: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500",
      valueClass: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Đã giao / Hoàn tất",
      value: summaryStats.completed,
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500",
      valueClass: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white dark:bg-dark-surface p-3 sm:p-4 rounded-2xl border border-slate-100 dark:border-dark-border shadow-2xs flex items-center gap-2.5 sm:gap-3 min-w-0"
          >
            <div
              className={`size-9 sm:size-10 rounded-xl flex items-center justify-center shrink-0 ${card.iconClass}`}
            >
              <Icon className="size-4 sm:size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary uppercase tracking-wider truncate">
                {card.label}
              </p>
              <p className={`text-sm sm:text-lg font-black mt-0.5 truncate ${card.valueClass}`}>
                {card.value}{" "}
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400">
                  đơn
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStatsHeader;
