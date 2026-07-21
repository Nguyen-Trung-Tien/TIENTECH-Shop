import React from "react";
import { cn } from "../../utils/cn";

const Input = ({ className, type, ref, ...props }) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-[var(--border-color)] bg-transparent dark:bg-dark-surface/20 px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
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
