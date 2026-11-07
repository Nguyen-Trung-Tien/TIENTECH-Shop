import React from "react";
import { motion as Motion } from "framer-motion";
import Logo from "../UI/Logo";

/**
 * BrandLoader - Loading component tích hợp Logo thương hiệu TIEN TECH
 * Kết hợp Glowing Aura, Logo chính thức, thanh tiến trình Cyber Gradient và thông điệp trạng thái.
 */
const BrandLoader = ({
  message = "Đang tải hệ sinh thái...",
  subMessage = "TIENTECH Smart Ecosystem",
  size = "lg",
  fullScreen = false,
  minHeight = "min-h-[50vh]",
  className = "",
}) => {
  const content = (
    <Motion.div
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative flex flex-col items-center p-8 sm:p-10 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-2xl shadow-2xl max-w-sm w-full mx-4 text-center select-none overflow-hidden ${className}`}
    >
      {/* Ambient Radial Glow Effect */}
      <div
        className="absolute -top-12 -left-12 w-40 h-40 bg-blue-500/20 dark:bg-blue-500/30 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-12 -right-12 w-40 h-40 bg-cyan-400/20 dark:bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Brand Logo with Pulsing Ambient Halo */}
      <div className="relative mb-6">
        <Motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.75, 0.4],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -inset-3 bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 rounded-2xl blur-lg pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10">
          <Logo size={size} showText={true} />
        </div>
      </div>

      {/* Cyber Neon Progress Track */}
      <div className="w-48 sm:w-56 h-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-full overflow-hidden relative shadow-inner">
        <Motion.div
          className="absolute inset-y-0 w-2/5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]"
          initial={{ x: "-100%" }}
          animate={{ x: "280%" }}
          transition={{
            repeat: Infinity,
            duration: 1.6,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Loading Status Message */}
      <Motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-5 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 drop-shadow-xs"
      >
        {message}
      </Motion.p>

      {/* Brand Subtitle / Tech Tagline */}
      {subMessage && (
        <Motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-1 text-[11px] font-medium tracking-wide text-slate-500 dark:text-slate-400"
        >
          {subMessage}
        </Motion.p>
      )}
    </Motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 dark:bg-slate-950/80 backdrop-blur-md p-4 transition-all">
        {content}
      </div>
    );
  }

  return (
    <div
      className={`w-full flex items-center justify-center p-4 transition-colors duration-300 ${minHeight}`}
    >
      {content}
    </div>
  );
};

export default BrandLoader;

