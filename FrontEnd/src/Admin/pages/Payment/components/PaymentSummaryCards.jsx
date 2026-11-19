import React from "react";
import { TrendingUp, Clock, CornerDownLeft, PieChart } from "lucide-react";

const PaymentSummaryCards = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      label: "Tổng Doanh Thu",
      value: `${Number(summary.totalRevenue).toLocaleString("vi-VN")} ₫`,
      icon: TrendingUp,
      iconClass: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Chờ Xử Lý",
      value: `${Number(summary.pendingAmount).toLocaleString("vi-VN")} ₫`,
      icon: Clock,
      iconClass: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Đã Hoàn Tiền",
      value: `${Number(summary.refundedAmount).toLocaleString("vi-VN")} ₫`,
      icon: CornerDownLeft,
      iconClass:
        "bg-slate-100 dark:bg-dark-card border border-transparent dark:border-dark-border text-slate-600 dark:text-slate-400",
    },
    {
      label: "Giao dịch Online / COD",
      value: `${summary.onlineCount} / ${summary.codCount}`,
      icon: PieChart,
      iconClass: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 print:hidden">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white dark:bg-dark-surface p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-dark-border shadow-xs flex items-center gap-4 min-w-0"
          >
            <div
              className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${card.iconClass}`}
            >
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary mb-0.5 truncate">
                {card.label}
              </p>
              <h3 className="text-xl font-black text-slate-900 dark:text-dark-text-primary tracking-tight truncate">
                {card.value}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentSummaryCards;
