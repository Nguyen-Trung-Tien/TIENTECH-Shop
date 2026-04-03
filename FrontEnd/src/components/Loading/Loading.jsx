import { motion as Motion } from "framer-motion";

const Loading = ({ message = "Đang tải dữ liệu..." }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-md">
      <Motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex flex-col items-center p-8 rounded-3xl bg-white shadow-2xl border border-slate-100"
      >
        {/* Modern Spinner */}
        <div className="relative w-16 h-16">
          <Motion.div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
          <Motion.div
            className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <Motion.div className="absolute inset-4 bg-primary/10 rounded-full animate-pulse" />
        </div>

        {/* Text */}
        <Motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-sm font-bold text-slate-800 tracking-wide uppercase"
        >
          {message}
        </Motion.p>

        {/* Progress Bar Sub-indicator */}
        <div className="mt-4 w-32 h-1 bg-slate-100 rounded-full overflow-hidden">
          <Motion.div
            className="h-full bg-primary"
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
