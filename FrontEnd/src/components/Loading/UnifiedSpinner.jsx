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
  const dimensions =
    {
      xs: "size-4 border-[2px]",
      sm: "size-5 border-[2.5px]",
      md: "size-8 border-[3px]",
      lg: "size-11 border-[3.5px]",
      xl: "size-16 border-[4px]",
    }[size] || "size-8 border-[3px]";

  const variantClasses =
    {
      primary:
        "border-blue-500/20 dark:border-blue-400/20 border-t-blue-600 border-r-indigo-500 dark:border-t-blue-400 dark:border-r-indigo-400 drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]",
      brand:
        "border-rose-500/20 dark:border-rose-400/20 border-t-rose-600 border-r-pink-500 dark:border-t-rose-500 dark:border-r-pink-400 drop-shadow-[0_0_10px_rgba(225,29,72,0.5)]",
      white:
        "border-white/20 border-t-white border-r-white/80 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]",
      slate:
        "border-slate-300 dark:border-slate-700 border-t-slate-800 border-r-slate-500 dark:border-t-slate-200 dark:border-r-slate-400",
      danger:
        "border-red-500/20 dark:border-red-400/20 border-t-red-600 border-r-rose-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]",
    }[variant] ||
    "border-blue-500/20 dark:border-blue-400/20 border-t-blue-600 border-r-indigo-500 drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]";

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <div
        className={`rounded-full animate-spin ${dimensions} ${variantClasses}`}
        role="status"
        aria-label="loading"
      />
      {size !== "xs" && size !== "sm" && (
        <div
          className={`absolute rounded-full animate-ping opacity-25 ${dimensions} ${variantClasses}`}
        />
      )}
    </div>
  );
};

export default UnifiedSpinner;
