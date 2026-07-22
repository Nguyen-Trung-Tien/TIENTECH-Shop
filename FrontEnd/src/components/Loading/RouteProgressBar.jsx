import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";

const RouteProgressBar = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProgress(30);

    const timer1 = setTimeout(() => setProgress(70), 100);
    const timer2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setLoading(false), 200);
    }, 250);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none">
          <Motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            exit={{ opacity: 0 }}
            transition={{ ease: "easeOut", duration: 0.2 }}
            className="h-1 bg-gradient-to-r from-primary via-indigo-500 to-violet-500 shadow-[0_0_10px_#3b82f6]"
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default RouteProgressBar;
