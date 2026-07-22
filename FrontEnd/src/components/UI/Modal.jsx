import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiX, FiAlertTriangle, FiCheckCircle, FiInfo, FiTrash2 } from "react-icons/fi";
import { Button } from "./Button";

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
}) => {
  const isModalOpen = isOpen || show;
  const sizes = {
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Overlay */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Modal Window Container */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`relative w-full ${sizes[size]} bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-slate-200/80 dark:border-slate-800 transition-colors duration-300 ${className}`}
          >
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
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
                    className="size-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Body Content */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar text-slate-700 dark:text-slate-200">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-950/40">
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
    if (CustomIcon) return { Icon: CustomIcon, style: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-blue-500/20" };
    switch (variant) {
      case "danger":
      case "destructive":
        return { Icon: FiTrash2, style: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 ring-rose-500/20" };
      case "warning":
        return { Icon: FiAlertTriangle, style: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 ring-amber-500/20" };
      case "success":
        return { Icon: FiCheckCircle, style: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20" };
      default:
        return { Icon: FiInfo, style: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 ring-blue-500/20" };
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
    >
      <div className="flex flex-col items-center py-3">
        <div className={`size-16 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-transparent ring-4 ${style}`}>
          <Icon />
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-1.5">
          {title}
        </h3>

        {message && (
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-4 max-w-xs">
            {message}
          </p>
        )}

        {children}

        <div className="flex w-full gap-3 mt-4">
          <Button
            variant="secondary"
            className="flex-1 py-3 text-xs uppercase font-bold"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "destructive" : variant}
            className="flex-1 py-3 text-xs uppercase font-bold"
            onClick={onConfirm}
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
