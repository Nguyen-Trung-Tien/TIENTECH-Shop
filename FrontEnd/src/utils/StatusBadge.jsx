import React from "react";

/**
 * Common Status Badge component for Order and Payment statuses
 * @param {object} props - { map, status, className }
 */
export const StatusBadge = ({ map, status, className = "" }) => {
  const currentStatus = map[status] || { label: status, color: "bg-slate-100 text-slate-500 border-slate-200" };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm transition-all duration-300 ${currentStatus.color} ${className}`}
    >
      {currentStatus.label}
    </span>
  );
};

export default StatusBadge;
