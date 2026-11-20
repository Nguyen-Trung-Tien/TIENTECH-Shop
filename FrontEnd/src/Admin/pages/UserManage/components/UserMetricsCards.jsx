import React from "react";
import { Users, UserCheck, AlertCircle, UserX, Shield } from "lucide-react";
import { StatCard } from "../../../../components/UI";

const UserMetricsCards = ({ metrics, loadingMetrics, totalItems }) => {
  const cards = [
    {
      label: "Tổng user",
      value: metrics?.totalUsers ?? totalItems,
      icon: Users,
      tone: "primary",
    },
    {
      label: "Hoạt động",
      value: metrics?.activeUsers ?? 0,
      icon: UserCheck,
      tone: "success",
    },
    {
      label: "Chờ OTP",
      value: metrics?.pendingUsers ?? 0,
      icon: AlertCircle,
      tone: "warning",
    },
    {
      label: "Đã khóa",
      value: metrics?.suspendedUsers ?? 0,
      icon: UserX,
      tone: "danger",
    },
    {
      label: "Quản trị",
      value: metrics?.adminUsers ?? 0,
      icon: Shield,
      tone: "primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-2">
      {cards.map((card) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={loadingMetrics ? "..." : card.value}
          icon={card.icon}
          tone={card.tone}
        />
      ))}
    </div>
  );
};

export default UserMetricsCards;
