import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import Button from "./Button";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  showClose = true,
  closeOnOverlayClick = true,
  className = "",
}) => {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-[95vw]",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Overlay */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full ${sizes[size]} bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col ${className}`}
          >
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between p-6 pb-2">
                <h3 className="text-xl font-display font-bold text-surface-900">
                  {title}
                </h3>
                {showClose && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-surface-100 rounded-xl transition-colors text-surface-400 hover:text-surface-900"
                  >
                    <FiX size={24} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-6 pt-2 flex justify-end gap-3">{footer}</div>
            )}
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "primary",
  loading = false,
  icon: Icon,
  iconClassName = "bg-primary/10 text-primary",
  children,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={null}
      showClose={false}
      className="text-center"
    >
      <div className="flex flex-col items-center py-2">
        {Icon && (
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-surface-100 ${iconClassName}`}
          >
            <Icon />
          </div>
        )}
        <h3 className="text-xl font-bold text-surface-900 mb-2">{title}</h3>
        {message && <p className="text-surface-500 text-sm mb-6">{message}</p>}
        {children}

        <div className="flex w-full gap-3 mt-6">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            className="flex-1"
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
