import React from "react";
import UnifiedSpinner from "../Loading/UnifiedSpinner";

const Loader = ({ className, size = "md", variant = "primary" }) => {
  return <UnifiedSpinner size={size} variant={variant} className={className} />;
};

export default Loader;
