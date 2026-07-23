import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiX, FiAlertTriangle, FiCheckCircle, FiInfo, FiTrash2 } from "react-icons/fi";
import { Button } from "./Button";
import UnifiedSpinner from "../Loading/UnifiedSpinner";

const Modal = ({
  isOpen,
  show,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
  showClose = true,
  closeOnOverlayClick = true,
  className = "",
  loading = false,
  loadingMessage = "Đang xử lý...",
}) => {
  const isModalOpen = isOpen || show;
  const sizes = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "4xl": "max-w-4xl",
    full: "max-w-[95vw]",
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Overlay */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
          />

          {/* Modal Window Container */}
          <Motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={`relative w-full ${sizes[size]} max-h-[92vh] sm:max-h-[85vh] bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200/80 dark:border-slate-800 transition-colors duration-300 ${className}`}
          >
            {/* Mobile Drag Indicator Pill */}
            <div className="flex justify-center pt-2.5 pb-1 sm:hidden bg-slate-50/80 dark:bg-slate-950/60">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            {/* Modal Popup Loading Overlay */}
            <AnimatePresence>
              {loading && (
                <Motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-white/75 dark:bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center gap-3 p-6 text-center"
                >
                  <UnifiedSpinner size="lg" variant="primary" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-100 animate-pulse">
                    {loadingMessage}
                  </p>
                </Motion.div>
              )}
            </AnimatePresence>

            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between p-5 sm:p-6 pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
                {showClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="size-8 sm:size-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  >
                    <FiX size={18} />
                  </button>
                )}
              </div>
            )}

            {/* Body Content */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto custom-scrollbar text-slate-700 dark:text-slate-200">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-5 sm:p-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-950/40">
                {footer}
              </div>
            )}
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ConfirmModal = ({
  isOpen,
  show,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "primary",
  loading = false,
  icon: CustomIcon,
  children,
}) => {
  const getIconAndStyle = () => {
    if (CustomIcon) return { Icon: CustomIcon, style: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30" };
    switch (variant) {
      case "danger":
      case "destructive":
        return { Icon: FiTrash2, style: "bg-rose-50 dark:bg-rose-950/40 text-rose-500 dark:text-rose-400 border-rose-100 dark:border-rose-900/30" };
      case "warning":
        return { Icon: FiAlertTriangle, style: "bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" };
      case "success":
        return { Icon: FiCheckCircle, style: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" };
      default:
        return { Icon: FiInfo, style: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30" };
    }
  };

  const { Icon, style } = getIconAndStyle();

  return (
    <Modal
      isOpen={isOpen || show}
      onClose={onClose}
      size="sm"
      title={null}
      showClose={false}
      className="text-center"
      loading={loading}
    >
      <div className="flex flex-col items-center py-1">
        <div className={`size-14 sm:size-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mb-4 border shadow-inner ${style}`}>
          <Icon />
        </div>

        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase mb-1.5">
          {title}
        </h3>

        {message && (
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed mb-5 max-w-xs">
            {message}
          </p>
        )}

        {children}

        <div className="flex w-full gap-2.5 sm:gap-3 mt-4">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 h-11 rounded-xl text-[11px] font-black uppercase tracking-wider"
            onClick={(e) => {
              if (e && e.preventDefault) e.preventDefault();
              if (e && e.stopPropagation) e.stopPropagation();
              if (onClose) onClose(e);
            }}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "danger" ? "destructive" : variant}
            className={`flex-1 h-11 rounded-xl text-[11px] font-black uppercase tracking-wider ${
              variant === "danger" || variant === "destructive" ? "bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20" : ""
            }`}
            onClick={(e) => {
              if (e && e.preventDefault) e.preventDefault();
              if (e && e.stopPropagation) e.stopPropagation();
              if (onConfirm) onConfirm(e);
            }}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default Modal;
