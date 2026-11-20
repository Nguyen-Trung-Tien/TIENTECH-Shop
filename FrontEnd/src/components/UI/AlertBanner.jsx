import React from "react";
import {
  FiInfo,
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertCircle,
  FiX,
} from "react-icons/fi";
import { Button } from "./Button";
import { AlertPopup } from "./AlertPopup";

const VARIANT_STYLES = {
  info: {
    wrapper:
      "bg-blue-50/90 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-100",
    icon: FiInfo,
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  success: {
    wrapper:
      "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100",
    icon: FiCheckCircle,
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    wrapper:
      "bg-amber-50/90 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-100",
    icon: FiAlertTriangle,
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  error: {
    wrapper:
      "bg-rose-50/90 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-100",
    icon: FiAlertCircle,
    iconColor: "text-rose-600 dark:text-rose-400",
  },
};

/**
 * Unified status / feedback banner or popup dialog (400/401/402/403, maintenance, notices).
 * Supports both inline banner (`mode="banner"`, default) and popup dialog (`mode="popup"` or `asPopup={true}`).
 */
const AlertBanner = ({
  variant = "info",
  title,
  message,
  actionLabel,
  onAction,
  onDismiss,
  className = "",
  mode = "banner",
  asPopup = false,
  isOpen,
  show,
}) => {
  if (mode === "popup" || asPopup) {
    const isVisible =
      isOpen !== undefined
        ? Boolean(isOpen)
        : show !== undefined
          ? Boolean(show)
          : true;
    return (
      <AlertPopup
        isOpen={isVisible}
        onClose={onDismiss}
        onConfirm={onAction || onDismiss}
        title={title}
        message={message}
        variant={variant}
        confirmText={actionLabel || "Đã hiểu"}
        className={className}
      />
    );
  }

  const style = VARIANT_STYLES[variant] || VARIANT_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      role="status"
      className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 ${style.wrapper} ${className}`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <Icon
          className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconColor}`}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          {title && (
            <p className="text-sm font-bold break-words [overflow-wrap:anywhere]">
              {title}
            </p>
          )}
          {message && (
            <p className="text-xs sm:text-sm opacity-90 mt-0.5 break-words [overflow-wrap:anywhere]">
              {message}
            </p>
          )}
        </div>
      </div>

      {(actionLabel || onDismiss) && (
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {actionLabel && onAction && (
            <Button size="sm" variant="secondary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Đóng thông báo"
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertBanner;
