import React, { useState, useRef, useEffect } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";
import Loader from "./Loader";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-dark-bg disabled:pointer-events-none disabled:opacity-50 gap-2 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover shadow-md shadow-primary/10",
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/15",
        brand: "bg-brand text-white hover:bg-brand-hover shadow-md shadow-brand/10",
        destructive: "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/15",
        danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/15",
        success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/15",
        warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/15",
        outline: "border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
        secondary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700",
        ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-slate-500 dark:text-slate-400",
        link: "text-blue-600 underline-offset-4 hover:underline",
        glass: "glass-card hover:bg-white/20 dark:hover:bg-slate-800/10 text-slate-900 dark:text-white border-white/25 dark:border-white/5",
      },
      size: {
        xs: "h-8 px-3 text-[11px] rounded-lg",
        sm: "h-9 px-4 text-xs rounded-xl",
        default: "h-10 px-5 text-xs rounded-xl",
        md: "h-10 px-5 text-xs rounded-xl",
        lg: "h-11 px-6 text-xs font-black uppercase tracking-wider rounded-xl",
        xl: "h-12 px-7 text-xs sm:text-sm font-black uppercase tracking-widest rounded-2xl",
        icon: "size-10 rounded-xl flex items-center justify-center p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = ({
  className = "",
  variant = "default",
  size = "default",
  loading = false,
  loadingText = "",
  asChild = false,
  type = "button",
  ref = undefined,
  children = null,
  icon: Icon = undefined,
  onClick = undefined,
  disabled = false,
  ...props
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const isMountedRef = useRef(true);
  const inFlightRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isLoading = Boolean(loading || internalLoading);

  const handleClick = (e) => {
    if (isLoading || disabled || inFlightRef.current) {
      e?.preventDefault?.();
      return;
    }
    if (!onClick) return;

    const result = onClick(e);
    if (result && typeof result.then === "function") {
      inFlightRef.current = true;
      setInternalLoading(true);
      Promise.resolve(result).finally(() => {
        inFlightRef.current = false;
        if (isMountedRef.current) {
          setInternalLoading(false);
        }
      });
    }
  };

  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      type={asChild ? undefined : type}
      aria-busy={isLoading || undefined}
      className={cn(buttonVariants({ variant, size, className }), isLoading && "opacity-75 pointer-events-none")}
      ref={ref}
      disabled={isLoading || disabled}
      onClick={onClick ? handleClick : undefined}
      {...props}
    >
      {isLoading && (
        <Loader
          size={size === "sm" || size === "xs" ? "xs" : "sm"}
          variant={
            ["primary", "default", "brand", "destructive", "danger", "success", "warning"].includes(variant || "default")
              ? "white"
              : "primary"
          }
        />
      )}
      {!isLoading && Icon && (React.isValidElement(Icon) ? Icon : <Icon className="size-4 shrink-0" />)}
      {isLoading && loadingText ? loadingText : children}
    </Comp>
  );
};

Button.displayName = "Button";

export { Button };
export default Button;
