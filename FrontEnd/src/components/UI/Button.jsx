import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";
import Loader from "./Loader";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover shadow-sm",
        primary: "bg-primary text-white hover:bg-primary-hover shadow-sm",
        brand: "bg-brand text-white hover:bg-brand-hover shadow-sm",
        destructive: "bg-danger text-white hover:bg-red-600 shadow-sm",
        danger: "bg-danger text-white hover:bg-red-600 shadow-sm",
        success: "bg-success text-white hover:bg-emerald-600 shadow-sm",
        warning: "bg-warning text-white hover:bg-amber-600 shadow-sm",
        outline: "border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-main)] text-[var(--text-main)]",
        secondary: "bg-surface-100 text-[var(--text-main)] hover:bg-surface-200",
        ghost: "hover:bg-surface-100 hover:text-[var(--text-main)]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = ({ className, variant, size, loading = false, asChild = false, ref, children, ...props }) => {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }), loading && "opacity-70 pointer-events-none")}
      ref={ref}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader size={size === "sm" ? "sm" : "md"} />}
      {children}
    </Comp>
  );
};

Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
