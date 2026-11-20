import React from "react";
import { m as Motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiAlertCircle } from "react-icons/fi";
import { cn } from "../../utils/cn";

/**
 * Unified Select component matching Input styling, height, focus ring, and error state.
 */
const Select = ({
  className,
  containerClassName,
  error,
  label,
  required,
  options,
  placeholder,
  children,
  ref,
  ...props
}) => {
  const selectEl = (
    <div className="relative w-full">
      <select
        ref={ref}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          "flex h-11 w-full appearance-none rounded-2xl border border-[var(--border-color)] bg-transparent dark:bg-dark-surface/20 pl-4 pr-10 py-2.5 text-sm text-[var(--text-main)] focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
          error && "border-danger/70 focus:border-danger focus:ring-danger/15",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" className="bg-white dark:bg-dark-card text-surface-500">
            {placeholder}
          </option>
        )}
        {Array.isArray(options)
          ? options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-white dark:bg-dark-card text-surface-900 dark:text-white"
              >
                {opt.label}
              </option>
            ))
          : children}
      </select>
      <FiChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-dark-text-secondary"
        aria-hidden="true"
      />
    </div>
  );

  return (
    <div className={cn("w-full min-w-0", (label || error) && "space-y-1.5", containerClassName)}>
      {label && (
        <label className="block text-xs font-bold text-surface-700 dark:text-dark-text-secondary">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      {selectEl}
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

export default Select;
