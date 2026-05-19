import React from "react";
import { cn } from "../../utils/cn";

const Input = ({ className, type, ref, ...props }) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-lg border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--text-main)] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[var(--color-dark-bg)] dark:border-[var(--color-dark-border)]",
        className
      )}
      ref={ref}
      {...props}
    />
  );
};
Input.displayName = "Input";

export { Input };
export default Input;
