import React from "react";
import { motion as Motion } from "framer-motion";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

/**
 * Reusable inline error banner with optional retry action.
 */
const ErrorBanner = ({
  message,
  onRetry,
  retryLabel = "Thử lại",
  className = "",
}) => {
  if (!message) return null;

  return (
    <Motion.div
      role="alert"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger dark:text-danger-light ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <FiAlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
        <p className="text-sm font-medium min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
          {message}
        </p>
      </div>
      {typeof onRetry === "function" && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-danger text-white text-xs font-bold hover:bg-danger/90 transition-colors shrink-0 cursor-pointer"
        >
          <FiRefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{retryLabel}</span>
        </button>
      )}
    </Motion.div>
  );
};

export default ErrorBanner;
