import React from "react";
import { TrendingUp, Clock, CornerDownLeft, PieChart } from "lucide-react";
import { StatCard } from "../../../../components/UI";

const PaymentSummaryCards = ({ summary }) => {
  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 print:hidden">
      <StatCard
        label="Tổng Doanh Thu"
        value={`${Number(summary.totalRevenue || 0).toLocaleString("vi-VN")} ₫`}
        icon={TrendingUp}
        tone="success"
      />
      <StatCard
        label="Chờ Xử Lý"
        value={`${Number(summary.pendingAmount || 0).toLocaleString("vi-VN")} ₫`}
        icon={Clock}
        tone="warning"
      />
      <StatCard
        label="Đã Hoàn Tiền"
        value={`${Number(summary.refundedAmount || 0).toLocaleString("vi-VN")} ₫`}
        icon={CornerDownLeft}
        tone="danger"
      />
      <StatCard
        label="Giao dịch Online / COD"
        value={`${summary.onlineCount || 0} / ${summary.codCount || 0}`}
        icon={PieChart}
        tone="primary"
      />
    </div>
  );
};

export default PaymentSummaryCards;
