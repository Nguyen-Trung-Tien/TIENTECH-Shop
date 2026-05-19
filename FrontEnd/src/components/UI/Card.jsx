import React from "react";
import { cn } from "../../utils/cn";

const Card = ({ className, ref, ...props }) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm dark:bg-[var(--color-dark-surface)]",
      className
    )}
    {...props}
  />
);
Card.displayName = "Card";

const CardHeader = ({ className, ref, ...props }) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
);
CardHeader.displayName = "CardHeader";

const CardTitle = ({ className, ref, ...props }) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight text-lg", className)}
    {...props}
  />
);
CardTitle.displayName = "CardTitle";

const CardDescription = ({ className, ref, ...props }) => (
  <p
    ref={ref}
    className={cn("text-sm text-[var(--text-muted)]", className)}
    {...props}
  />
);
CardDescription.displayName = "CardDescription";

const CardContent = ({ className, ref, ...props }) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = ({ className, ref, ...props }) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export default Card;
