import React from "react";

const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  className = "", 
  disabled = false, 
  loading = false,
  icon: Icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-standard active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl";
  
  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-hover hover:shadow-primary/30",
    secondary: "bg-white text-surface-900 border border-surface-200 hover:border-primary/30 hover:bg-surface-50",
    brand: "bg-brand text-white shadow-lg shadow-brand/20 hover:bg-brand-hover hover:shadow-brand/30",
    ghost: "bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-900",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
    icon: "p-2.5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : Icon ? (
        <Icon className={children ? "mr-2" : ""} size={size === "sm" ? 16 : 18} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
