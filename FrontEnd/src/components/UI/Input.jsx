import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { cn } from "../../utils/cn";

const Input = ({ className, containerClassName, type, error, label, required, icon: Icon, ref, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  const inputEl = (
    <div className="relative w-full">
      {Icon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
          {typeof Icon === "function" ? <Icon size={16} aria-hidden="true" /> : Icon}
        </span>
      )}
      <input
        type={resolvedType}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-[var(--border-color)] bg-transparent dark:bg-dark-surface/20 px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
          Icon && "pl-10",
          isPassword && "pr-11",
          error && "border-danger/70 focus:border-danger focus:ring-danger/15",
          className
        )}
        ref={ref}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      )}
    </div>
  );

  if (!label && !error) {
    return inputEl;
  }

  return (
    <div className={cn("w-full space-y-1.5 min-w-0", containerClassName)}>
      {label && (
        <label className="block text-xs font-bold text-surface-700 dark:text-dark-text-secondary">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      {inputEl}
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
            <span className="min-w-0 break-words">{error}</span>
          </Motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
Input.displayName = "Input";

export { Input };
export default Input;
