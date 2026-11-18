import React from "react";

/**
 * Unified responsive Tabs component (pill or underline variant)
 * with horizontal scroll support on mobile and zero-overflow labels.
 */
const Tabs = ({
  items = [],
  activeKey,
  onChange,
  variant = "pill",
  className = "",
}) => {
  if (!items.length) return null;

  return (
    <div
      role="tablist"
      className={`flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar min-w-0 ${
        variant === "underline"
          ? "border-b border-surface-200 dark:border-dark-border gap-4 pb-0"
          : "p-1 bg-surface-100/80 dark:bg-dark-card rounded-2xl border border-surface-200/80 dark:border-dark-border"
      } ${className}`}
    >
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const Icon = item.icon;

        const baseClasses =
          "inline-flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

        const variantClasses =
          variant === "underline"
            ? `px-1 py-3 border-b-2 -mb-px ${
                isActive
                  ? "border-primary text-primary dark:text-primary-light"
                  : "border-transparent text-surface-500 dark:text-dark-text-secondary hover:text-surface-900 dark:hover:text-white"
              }`
            : `px-3.5 py-2 rounded-xl ${
                isActive
                  ? "bg-white dark:bg-dark-surface text-primary dark:text-white shadow-sm border border-surface-200/60 dark:border-dark-border"
                  : "text-surface-600 dark:text-dark-text-secondary hover:text-surface-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-dark-surface/50"
              }`;

        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={item.disabled}
            onClick={() => onChange && onChange(item.key)}
            className={`${baseClasses} ${variantClasses} ${
              item.disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
            <span>{item.label}</span>
            {item.count !== undefined && item.count !== null && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold leading-none ${
                  isActive
                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light"
                    : "bg-surface-200/80 dark:bg-dark-border text-surface-600 dark:text-dark-text-secondary"
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
