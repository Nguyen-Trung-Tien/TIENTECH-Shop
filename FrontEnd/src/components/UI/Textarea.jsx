import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";
import { cn } from "../../utils/cn";

/**
 * Unified Textarea component matching Input styling, focus ring, and error state.
 */
const Textarea = ({
  className,
  error,
  label,
  required,
  rows = 4,
  ref,
  ...props
}) => {
  const textareaEl = (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={Boolean(error) || undefined}
      className={cn(
        "flex min-h-[96px] w-full rounded-2xl border border-[var(--border-color)] bg-transparent dark:bg-dark-surface/20 px-4 py-3 text-sm text-[var(--text-main)] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        error && "border-danger/70 focus:border-danger focus:ring-danger/15",
        className
      )}
      {...props}
    />
  );

  if (!label && !error) {
    return textareaEl;
  }

  return (
    <div className="w-full space-y-1.5 min-w-0">
      {label && (
        <label className="block text-xs font-bold text-surface-700 dark:text-dark-text-secondary">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      {textareaEl}
      <AnimatePresence>
        {error && (
          <Motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-danger dark:text-danger-light"
          >
            <FiAlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </Motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Textarea;
