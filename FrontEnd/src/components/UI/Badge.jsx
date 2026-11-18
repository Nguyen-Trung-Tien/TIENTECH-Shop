import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white shadow hover:bg-primary-hover",
        primary:
          "border-transparent bg-primary text-white shadow hover:bg-primary-hover",
        secondary:
          "border-transparent bg-surface-100 dark:bg-dark-card text-[var(--text-main)] hover:bg-surface-200",
        neutral:
          "border-slate-200 dark:border-dark-border bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-slate-300",
        info:
          "border-blue-200/70 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400",
        destructive:
          "border-transparent bg-danger text-white shadow hover:bg-red-600",
        danger:
          "border-transparent bg-danger text-white shadow hover:bg-red-600",
        outline: "text-[var(--text-main)] border-[var(--border-color)]",
        success: "border-transparent bg-success text-white shadow",
        warning: "border-transparent bg-warning text-white shadow",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

function Badge({ className, variant, size, dot = false, icon: Icon, children, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current shrink-0" aria-hidden="true" />}
      {Icon && (typeof Icon === "function" ? <Icon className="size-3 shrink-0" aria-hidden="true" /> : Icon)}
      {children}
    </div>
  );
}

export { Badge };
export default Badge;
