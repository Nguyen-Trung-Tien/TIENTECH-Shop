import React from "react";

const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200 ring-amber-500/10";
      case "confirmed":
        return "bg-sky-100 text-sky-700 border-sky-200 ring-sky-500/10";
      case "shipped":
        return "bg-indigo-100 text-indigo-700 border-indigo-200 ring-indigo-500/10";
      case "delivered":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 ring-emerald-500/10";
      case "cancelled":
        return "bg-rose-100 text-rose-700 border-rose-200 ring-rose-500/10";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10";
    }
  };

  const getStatusLabel = () => {
    switch (status?.toLowerCase()) {
      case "pending": return "Chờ xử lý";
      case "confirmed": return "Đã xác nhận";
      case "shipped": return "Đang giao";
      case "delivered": return "Đã giao";
      case "cancelled": return "Đã hủy";
      default: return "Không rõ";
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${getStatusStyles()}`}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70"></span>
      {getStatusLabel()}
    </span>
  );
};

export default StatusBadge;
