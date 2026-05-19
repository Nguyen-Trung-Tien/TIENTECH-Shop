import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-primary)] text-white shadow hover:bg-[var(--color-primary-hover)]",
        secondary:
          "border-transparent bg-[var(--color-surface-100)] text-[var(--text-main)] hover:bg-[var(--color-surface-200)]",
        destructive:
          "border-transparent bg-[var(--color-danger)] text-white shadow hover:bg-red-600",
        outline: "text-[var(--text-main)] border-[var(--border-color)]",
        success: "border-transparent bg-[var(--color-success)] text-white shadow",
        warning: "border-transparent bg-[var(--color-warning)] text-white shadow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
export default Badge;
