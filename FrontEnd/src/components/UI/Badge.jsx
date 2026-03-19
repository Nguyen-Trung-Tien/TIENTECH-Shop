import React from "react";

const Badge = ({ 
  children, 
  variant = "primary", 
  className = "" 
}) => {
  const baseStyles = "inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider";
  
  const variants = {
    primary: "bg-primary/10 text-primary border border-primary/20",
    brand: "bg-brand/10 text-brand border border-brand/20",
    success: "bg-success/10 text-success border border-success/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
    danger: "bg-danger/10 text-danger border border-danger/20",
    info: "bg-info/10 text-info border border-info/20",
    surface: "bg-surface-100 text-surface-500 border border-surface-200",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
