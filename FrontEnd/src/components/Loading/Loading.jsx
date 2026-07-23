import { motion as Motion } from "framer-motion";
import UnifiedSpinner from "./UnifiedSpinner";

const Loading = ({ message = "Đang tải dữ liệu..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-md p-4">
      <Motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        className="flex flex-col items-center p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 shadow-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xl max-w-xs w-full text-center"
      >
        {/* Unified Modern Spinner */}
        <UnifiedSpinner size="xl" variant="primary" />

        {/* Text */}
        <Motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-5 text-xs font-black text-slate-800 dark:text-slate-200 tracking-wider uppercase"
        >
          {message}
        </Motion.p>

        {/* Animated Sub-indicator Bar */}
        <div className="mt-4 w-32 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <Motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
        </div>
      </Motion.div>
    </div>
  );
};

export default Loading;
