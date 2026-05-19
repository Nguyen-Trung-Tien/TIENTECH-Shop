import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-sm",
        brand: "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)] shadow-sm",
        destructive: "bg-[var(--color-danger)] text-white hover:bg-red-600 shadow-sm",
        outline: "border border-[var(--border-color)] bg-transparent hover:bg-[var(--bg-main)] text-[var(--text-main)]",
        secondary: "bg-[var(--color-surface-100)] text-[var(--text-main)] hover:bg-[var(--color-surface-200)]",
        ghost: "hover:bg-[var(--color-surface-100)] hover:text-[var(--text-main)]",
        link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
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

const Button = ({ className, variant, size, asChild = false, ref, ...props }) => {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
};

Button.displayName = "Button";

export { Button, buttonVariants };
export default Button;
