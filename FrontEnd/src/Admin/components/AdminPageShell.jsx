import React from "react";

/**
 * Unified shell for all Admin management pages, enforcing consistent
 * header typography, responsive action slots, optional KPI/filter bars,
 * and zero-overflow flex layout.
 */
const AdminPageShell = ({
  title,
  subtitle,
  eyebrow,
  actions,
  stats,
  filters,
  children,
  className = "",
}) => {
  return (
    <div className={`space-y-6 min-w-0 ${className}`}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
          <div className="min-w-0 flex-1">
            {eyebrow && (
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary dark:text-primary-light mb-1 truncate">
                {eyebrow}
              </p>
            )}
            {title && (
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white break-words [overflow-wrap:anywhere]">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-dark-text-secondary mt-1 break-words [overflow-wrap:anywhere]">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {stats && <div className="min-w-0">{stats}</div>}
      {filters && <div className="min-w-0">{filters}</div>}
      <div className="min-w-0">{children}</div>
    </div>
  );
};

export default AdminPageShell;
