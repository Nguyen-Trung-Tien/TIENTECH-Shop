import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";
import Loader from "./Loader";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 gap-2 select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/10",
        primary: "bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/10",
        brand: "bg-brand text-white hover:bg-brand-hover shadow-md shadow-brand/10",
        destructive: "bg-danger text-white hover:bg-red-600 shadow-md shadow-danger/10",
        danger: "bg-danger text-white hover:bg-red-600 shadow-md shadow-danger/10",
        success: "bg-success text-white hover:bg-emerald-600 shadow-md shadow-success/10",
        warning: "bg-warning text-white hover:bg-amber-600 shadow-md shadow-warning/10",
        outline: "border border-[var(--border-color)] bg-transparent hover:bg-slate-100 dark:hover:bg-dark-surface/50 text-[var(--text-main)]",
        secondary: "bg-slate-100 dark:bg-dark-surface text-[var(--text-main)] hover:bg-slate-200 dark:hover:bg-slate-700/60",
        ghost: "hover:bg-slate-100 dark:hover:bg-dark-surface/50 hover:text-[var(--text-main)] text-[var(--text-muted)]",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "glass-card hover:bg-white/20 dark:hover:bg-slate-800/10 text-[var(--text-main)] border-white/25 dark:border-white/5",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-xl px-4 text-xs",
        md: "h-11 rounded-2xl px-6",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = ({ className, variant, size, loading = false, asChild = false, ref, children, icon: Icon, ...props }) => {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }), loading && "opacity-70 pointer-events-none")}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader size={size === "sm" ? "sm" : "md"} />}
      {!loading && Icon && <Icon className="size-4 shrink-0" />}
      {children}
    </Comp>
  );
};

Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
