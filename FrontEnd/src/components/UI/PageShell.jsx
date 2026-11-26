import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

/**
 * Unified page shell providing consistent background tokens, container width,
 * optional back navigation, header, and error banner slot across all user pages.
 */
const PageShell = ({
  title,
  subtitle,
  eyebrow,
  backTo,
  backLabel = "Quay lại",
  actions,
  children,
  maxWidthClass = "container-custom",
  className = "",
}) => {
  return (
    <div
      className={`flex-1 bg-surface-50 dark:bg-dark-bg text-surface-900 dark:text-dark-text-primary transition-colors duration-300 pb-8 sm:pb-12 ${className}`}
    >
      {(title || backTo || actions) && (
        <header className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-surface-200 dark:border-dark-border py-6 sm:py-8 mb-6 sm:mb-8">
          <div className={maxWidthClass}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {backTo && (
                  <Link
                    to={backTo}
                    aria-label={backLabel}
                    className="size-10 sm:size-11 rounded-xl bg-surface-100 dark:bg-dark-card border border-surface-200 dark:border-dark-border flex items-center justify-center text-surface-600 dark:text-dark-text-secondary hover:text-primary dark:hover:text-primary-light transition-colors shrink-0"
                  >
                    <FiArrowLeft className="w-5 h-5" aria-hidden="true" />
                  </Link>
                )}
                <div className="min-w-0 flex-1">
                  {eyebrow && (
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary dark:text-primary-light mb-1 truncate">
                      {eyebrow}
                    </p>
                  )}
                  {title && (
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white break-words [overflow-wrap:anywhere]">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-surface-500 dark:text-dark-text-secondary mt-1 break-words [overflow-wrap:anywhere]">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              {actions && (
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </header>
      )}
      <div className={maxWidthClass}>{children}</div>
    </div>
  );
};

export default PageShell;
