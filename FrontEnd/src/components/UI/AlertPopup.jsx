import React, { useEffect } from "react";
import { m as Motion } from "framer-motion";
import {
  FiInfo,
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertCircle,
} from "react-icons/fi";
import Modal from "./Modal";
import { Button } from "./Button";

const VARIANT_CONFIGS = {
  info: {
    icon: FiInfo,
    style: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40 shadow-blue-500/10",
    buttonVariant: "primary",
    badgeLabel: "Thông báo",
  },
  success: {
    icon: FiCheckCircle,
    style: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40 shadow-emerald-500/10",
    buttonVariant: "primary",
    badgeLabel: "Thành công",
  },
  warning: {
    icon: FiAlertTriangle,
    style: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40 shadow-amber-500/10",
    buttonVariant: "primary",
    badgeLabel: "Cảnh báo",
  },
  error: {
    icon: FiAlertCircle,
    style: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40 shadow-rose-500/10",
    buttonVariant: "destructive",
    badgeLabel: "Lỗi",
  },
  danger: {
    icon: FiAlertCircle,
    style: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40 shadow-rose-500/10",
    buttonVariant: "destructive",
    badgeLabel: "Nguy hiểm",
  },
};

/**
 * AlertPopup - Single-action Alert Dialog component in UI library
 * Replaces intrusive window.alert() and static alert bars with a modern, accessible modal popup.
 */
export const AlertPopup = ({
  isOpen,
  show,
  onClose,
  onConfirm,
  title = "Thông báo",
  message,
  confirmText = "Đã hiểu",
  variant = "info",
  icon: CustomIcon,
  autoClose = 0,
  children,
  className = "",
}) => {
  const isModalOpen = Boolean(isOpen || show);
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.info;
  const IconComponent = CustomIcon || config.icon;

  useEffect(() => {
    if (isModalOpen && autoClose > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
        else if (onConfirm) onConfirm();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen, autoClose, onClose, onConfirm]);

  const handleAction = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (onConfirm) onConfirm(e);
    else if (onClose) onClose(e);
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={onClose || onConfirm}
      size="sm"
      title={null}
      showClose={true}
      className={`text-center ${className}`}
    >
      <div className="flex flex-col items-center py-2">
        <Motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -6 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 450, damping: 22 }}
          className={`size-16 sm:size-20 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl mb-4 border shadow-inner ${config.style}`}
        >
          {React.isValidElement(IconComponent) ? (
            IconComponent
          ) : (
            <IconComponent />
          )}
        </Motion.div>

        {title && (
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase mb-1.5 break-words [overflow-wrap:anywhere]">
            {title}
          </h3>
        )}

        {message && (
          <div className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-4 max-w-xs break-words [overflow-wrap:anywhere]">
            {message}
          </div>
        )}

        {children}

        <div className="w-full mt-4">
          <Button
            type="button"
            variant={config.buttonVariant}
            className="w-full h-11 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md"
            onClick={handleAction}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AlertPopup;
