import React from "react";

/**
 * UnifiedSpinner - Ultra-Sleek 60fps High-Tech Loading Spinner
 * Hiệu ứng xoay tròn phát sáng mượt mà 60fps, tương thích hoàn hảo mọi kích thước & màu sắc
 */
const UnifiedSpinner = ({
  size = "md",
  variant = "primary",
  className = "",
}) => {
  const sizeClasses =
    {
      xs: "w-4 h-4 border-[2px]",
      sm: "w-5 h-5 border-[2.5px]",
      md: "w-8 h-8 border-[3px]",
      lg: "w-11 h-11 border-[3.5px]",
      xl: "w-14 h-14 border-[4px]",
    }[size] || "w-8 h-8 border-[3px]";

  const variantClasses =
    {
      primary:
        "border-blue-100 dark:border-slate-800 border-t-blue-600 border-r-indigo-500 dark:border-t-blue-400 dark:border-r-indigo-400 drop-shadow-[0_0_6px_rgba(37,99,235,0.4)]",
      brand:
        "border-rose-100 dark:border-rose-950/40 border-t-rose-600 border-r-pink-500 dark:border-t-rose-500 dark:border-r-pink-400 drop-shadow-[0_0_6px_rgba(225,29,72,0.4)]",
      white:
        "border-white/20 border-t-white border-r-white/90 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]",
      slate:
        "border-slate-200 dark:border-slate-800 border-t-slate-700 border-r-slate-500 dark:border-t-slate-300 dark:border-r-slate-400",
      danger:
        "border-red-100 dark:border-red-950/40 border-t-red-600 border-r-rose-500 drop-shadow-[0_0_6px_rgba(220,38,38,0.4)]",
    }[variant] ||
    "border-blue-100 dark:border-slate-800 border-t-blue-600 border-r-indigo-500 drop-shadow-[0_0_6px_rgba(37,99,235,0.4)]";

  return (
    <div
      className={`inline-block rounded-full animate-spin shrink-0 ${sizeClasses} ${variantClasses} ${className}`}
      role="status"
      aria-label="loading"
    />
  );
};

export default UnifiedSpinner;
