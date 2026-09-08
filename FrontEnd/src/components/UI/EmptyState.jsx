import React from "react";
import { FiInbox, FiAlertCircle } from "react-icons/fi";
import { Button } from "./Button";

export const EmptyState = ({
  icon: Icon = FiInbox,
  title = "Không có dữ liệu",
  description = "Hiện tại chưa có nội dung hoặc dữ liệu phù hợp với yêu cầu của bạn.",
  actionText,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-dark-surface/40 backdrop-blur-sm ${className}`}
    >
      <div className="size-16 sm:size-20 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-inner">
        <Icon size={32} className="stroke-[1.5]" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-5">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export const ErrorState = ({
  icon: Icon = FiAlertCircle,
  title = "Đã xảy ra sự cố",
  description = "Không thể tải dữ liệu vào lúc này. Vui lòng thử lại sau.",
  retryText = "Thử lại",
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl border border-rose-200/80 dark:border-rose-950/50 bg-rose-50/30 dark:bg-rose-950/10 ${className}`}
    >
      <div className="size-16 sm:size-20 rounded-2xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400 mb-4">
        <Icon size={32} className="stroke-[1.5]" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-5">
          {description}
        </p>
      )}
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
