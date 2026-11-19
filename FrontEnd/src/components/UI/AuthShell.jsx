import React from "react";
import { useNavigate } from "react-router-dom";
import { m as Motion } from "framer-motion";
import { FiArrowLeft, FiShield, FiLock } from "react-icons/fi";
import Logo from "./Logo";

/**
 * Unified AuthShell for User Login, User Register, and Admin Portal Login.
 * Eliminates layout duplication while providing consistent animations and Dark Mode tokens.
 */
const AuthShell = ({
  variant = "user",
  badge,
  bannerTitle,
  bannerHighlight,
  bannerSubtitle,
  title,
  subtitle,
  formMaxWidth = "max-w-[380px]",
  maxWidth = "max-w-4xl",
  backTo = "/",
  backLabel = "Quay lại trang chủ",
  children,
}) => {
  const navigate = useNavigate();
  const isAdmin = variant === "admin";

  return (
    <div className="min-h-screen w-full bg-surface-100 dark:bg-dark-bg flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <Motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className={`w-full ${maxWidth} h-fit max-h-[96vh] grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-dark-surface rounded-2xl sm:rounded-3xl shadow-2xl border border-surface-200/80 dark:border-dark-border overflow-hidden`}
      >
        {/* Left Side - Branding Panel */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 items-center justify-center p-8 overflow-hidden">
          <div className="absolute -top-12 -left-12 w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-[70%] h-[70%] bg-indigo-600/20 rounded-full blur-[90px] pointer-events-none" />

          <div className="relative z-10 text-center flex flex-col items-center">
            <Logo size="xl" variant="light" className="justify-center mb-6" />
            <Motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-2xl font-black text-white mb-3 tracking-tight"
            >
              {bannerTitle}{" "}
              {bannerHighlight && (
                <span className="text-blue-400">{bannerHighlight}</span>
              )}
            </Motion.h2>
            <Motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed px-4 max-w-xs"
            >
              {bannerSubtitle}
            </Motion.p>

            <Motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="mt-8 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300"
            >
              <FiLock className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span>{isAdmin ? "Phiên quản trị bảo mật đa lớp" : "Bảo mật phiên HttpOnly & OAuth 2.0"}</span>
            </Motion.div>
          </div>
        </div>

        {/* Right Side - Form Panel */}
        <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-10 bg-white dark:bg-dark-surface overflow-y-auto max-h-[94vh] custom-scrollbar">
          <div className={`w-full ${formMaxWidth}`}>
            <div className="lg:hidden text-center mb-5 flex justify-center">
              <Logo size="lg" />
            </div>

            <div className="mb-6">
              {badge && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary dark:text-primary-light rounded-lg text-[11px] font-bold uppercase tracking-wider mb-3">
                  <FiShield className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{badge}</span>
                </div>
              )}
              <h1 className="text-2xl font-black text-surface-900 dark:text-white tracking-tight mb-1">
                {title}
              </h1>
              {subtitle && (
                <p className="text-surface-500 dark:text-dark-text-secondary text-xs md:text-sm font-medium">
                  {subtitle}
                </p>
              )}
            </div>

            {children}

            <div className="mt-6 pt-5 border-t border-surface-100 dark:border-dark-border text-center">
              <button
                type="button"
                onClick={() => navigate(backTo)}
                className="inline-flex items-center gap-2 text-xs text-surface-500 dark:text-dark-text-secondary hover:text-primary dark:hover:text-primary-light font-bold transition-colors cursor-pointer"
              >
                <FiArrowLeft aria-hidden="true" />
                <span>{backLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default AuthShell;
