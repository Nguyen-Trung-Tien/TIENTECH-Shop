import React, { useId } from "react";

const Input = React.forwardRef(({ label, error, className = "", id: externalId, ...props }, ref) => {
  const internalId = useId();
  const id = externalId || internalId;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-[11px] font-bold uppercase tracking-wider text-surface-500 dark:text-dark-text-secondary mb-1.5 ml-0.5 cursor-pointer"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`input-base ${
          error ? "border-danger focus:ring-danger/10 focus:border-danger" : ""
        }`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p 
          id={`${id}-error`} 
          className="mt-1 text-[10px] text-danger font-semibold uppercase tracking-tight ml-0.5 animate-in fade-in slide-in-from-top-1"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
