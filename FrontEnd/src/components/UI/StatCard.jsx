import React from "react";

const TONE_MAP = {
  primary:
    "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light",
  success:
    "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  warning:
    "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
  danger:
    "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
  neutral:
    "bg-surface-100 text-surface-600 dark:bg-dark-surface dark:text-dark-text-secondary",
};

/**
 * Unified KPI / Metric card for Admin & User summary grids.
 */
const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  tone = "primary",
  onClick,
  className = "",
}) => {
  const toneClasses = TONE_MAP[tone] || TONE_MAP.primary;
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`w-full text-left bg-white dark:bg-dark-card border border-surface-200 dark:border-dark-border rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200 flex items-center gap-4 min-w-0 ${
        onClick
          ? "hover:border-primary/40 hover:shadow-md cursor-pointer"
          : ""
      } ${className}`}
    >
      {Icon && (
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${toneClasses}`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-surface-500 dark:text-dark-text-secondary truncate">
          {label}
        </p>
        <p className="text-xl sm:text-2xl font-extrabold text-surface-900 dark:text-white mt-0.5 break-words [overflow-wrap:anywhere]">
          {value}
        </p>
        {subtext && (
          <p className="text-[11px] font-medium text-surface-400 dark:text-dark-text-secondary mt-0.5 truncate">
            {subtext}
          </p>
        )}
      </div>
    </Wrapper>
  );
};

export default StatCard;
