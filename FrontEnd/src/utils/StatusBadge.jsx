import React from "react";

/**
 * Common Status Badge component for Order and Payment statuses
 * Mang phong cách Modern UI: Soft background, high-contrast text, dot indicator.
 */
export const StatusBadge = ({ map, status, className = "" }) => {
  const current = map[status] || { label: status, variant: "secondary" };
  
  const getVariantStyles = (variant) => {
    switch (variant) {
      case "success":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
      case "danger":
        return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400";
      case "warning":
        return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
      case "info":
      case "primary":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400";
      default:
        return "bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400";
    }
  };

  const getDotStyles = (variant) => {
    switch (variant) {
      case "success": return "bg-emerald-500";
      case "danger": return "bg-rose-500";
      case "warning": return "bg-amber-500";
      case "info":
      case "primary": return "bg-indigo-500";
      default: return "bg-slate-400";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${getVariantStyles(current.variant)} ${className}`}
      style={{ border: '1px solid currentColor', borderOpacity: 0.1 }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotStyles(current.variant)} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.1)]`} />
      {current.label}
    </span>
  );
};

export default StatusBadge;
