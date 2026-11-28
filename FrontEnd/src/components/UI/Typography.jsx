import React from "react";
import { cn } from "../../utils/cn";

/**
 * Standardized Typography primitives enforcing consistent hierarchy
 * and zero-overflow text wrapping across all screen sizes.
 */
export const PageTitle = ({ className, children, as: Comp = "h1", ...props }) => (
  <Comp
    className={cn(
      "text-2xl sm:text-3xl font-extrabold tracking-tight text-surface-900 dark:text-white min-w-0 break-words [overflow-wrap:anywhere]",
      className
    )}
    {...props}
  >
    {children}
  </Comp>
);

export const SectionTitle = ({ className, children, as: Comp = "h2", ...props }) => (
  <Comp
    className={cn(
      "text-lg sm:text-xl font-bold tracking-tight text-surface-900 dark:text-white min-w-0 break-words [overflow-wrap:anywhere]",
      className
    )}
    {...props}
  >
    {children}
  </Comp>
);

export const CardTitle = ({ className, children, as: Comp = "h3", ...props }) => (
  <Comp
    className={cn(
      "text-base font-bold text-surface-900 dark:text-white min-w-0 break-words [overflow-wrap:anywhere]",
      className
    )}
    {...props}
  >
    {children}
  </Comp>
);

export const Text = ({
  className,
  variant = "body",
  children,
  as: Comp = "p",
  ...props
}) => {
  const variants = {
    body: "text-sm text-surface-700 dark:text-dark-text-primary",
    muted: "text-xs sm:text-sm text-surface-500 dark:text-dark-text-secondary",
    caption: "text-xs text-surface-500 dark:text-dark-text-secondary",
  };

  return (
    <Comp
      className={cn(
        variants[variant] || variants.body,
        "min-w-0 break-words [overflow-wrap:anywhere]",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
};
