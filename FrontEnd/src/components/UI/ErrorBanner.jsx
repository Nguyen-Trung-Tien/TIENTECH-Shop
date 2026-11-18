import React from "react";
import { motion as Motion } from "framer-motion";
import { FiAlertCircle, FiAlertTriangle, FiRefreshCw, FiX } from "react-icons/fi";

/**
 * Reusable inline error/warning banner with optional retry & dismiss actions.
 */
const ErrorBanner = ({
  title,
  message,
  variant = "danger",
  onRetry,
  retryLabel = "Thử lại",
  onDismiss,
  className = "",
}) => {
  if (!message) return null;

  const isWarning = variant === "warning";
  const Icon = isWarning ? FiAlertTriangle : FiAlertCircle;
  const toneClasses = isWarning
    ? "bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300"
    : "bg-danger/10 border-danger/20 text-danger dark:text-danger-light";

  return (
    <Motion.div
      role="alert"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border ${toneClasses} ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <Icon className="w-5 h-5 shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          {title && (
            <p className="text-xs font-extrabold uppercase tracking-wider mb-0.5 break-words">
              {title}
            </p>
          )}
          <p className="text-sm font-medium min-w-0 break-words [overflow-wrap:anywhere]">
            {message}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {typeof onRetry === "function" && (
          <button
            type="button"
            onClick={onRetry}
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer ${
              isWarning ? "bg-amber-600 hover:bg-amber-700" : "bg-danger hover:bg-danger/90"
            }`}
          >
            <FiRefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{retryLabel}</span>
          </button>
        )}
        {typeof onDismiss === "function" && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Đóng thông báo"
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>
    </Motion.div>
  );
};

export default ErrorBanner;
