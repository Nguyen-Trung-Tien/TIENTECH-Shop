import React from "react";
import { motion as Motion } from "framer-motion";
import { cn } from "../../utils/cn";

const Loader = ({ className, size = "md", color = "current" }) => {
  const sizeClasses = {
    sm: "size-4 border-2",
    md: "size-5 border-2",
    lg: "size-6 border-[3px]",
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <Motion.div
        className={cn(
          "rounded-full border-solid border-t-transparent animate-spin",
          sizeClasses[size] || sizeClasses.md,
          color === "current" ? "border-current" : `border-${color}`
        )}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 0.8,
          ease: "linear",
        }}
      />
    </div>
  );
};

export default Loader;
