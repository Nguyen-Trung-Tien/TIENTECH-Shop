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
  // Use focus-visible for accessibility
  const baseStyles =
    "inline-flex items-center justify-center font-bold transition-standard active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

  const variants = {
    primary:
      "bg-primary text-white shadow-md hover:bg-primary-hover focus-visible:ring-primary",
    secondary:
      "bg-white text-surface-900 border border-surface-200 hover:bg-surface-50 focus-visible:ring-surface-200 dark:bg-dark-surface dark:text-dark-text-primary dark:border-dark-border dark:hover:bg-dark-border",
    brand:
      "bg-brand text-white shadow-md hover:bg-brand-hover focus-visible:ring-brand",
    ghost:
      "bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-900 focus-visible:ring-surface-200 dark:text-dark-text-secondary dark:hover:bg-dark-surface dark:hover:text-dark-text-primary",
    danger:
      "bg-danger text-white shadow-md hover:bg-danger/90 focus-visible:ring-danger",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[11px]",
    md: "px-5 py-2 text-xs",
    lg: "px-6 py-2.5 text-sm",
    icon: "p-2",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <div
          className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"
          aria-hidden="true"
        />
      ) : Icon ? (
        <Icon
          className={children ? "mr-1.5" : ""}
          size={size === "sm" ? 14 : 16}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
