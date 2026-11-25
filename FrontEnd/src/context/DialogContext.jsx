import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { DialogContext } from "./dialogContextObject";
import { AlertPopup } from "../components/UI/AlertPopup";
import { ConfirmModal } from "../components/UI/Modal";
import Textarea from "../components/UI/Textarea";

export const DialogProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const queueRef = useRef([]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    return () => {
      queueRef.current.forEach((item) => {
        item.resolve(item.type === "confirm" ? false : undefined);
      });
    };
  }, []);

  const currentDialog = queue[0] || null;

  const enqueueDialog = useCallback((dialogConfig) => {
    return new Promise((resolve) => {
      setQueue((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          ...dialogConfig,
          resolve,
        },
      ]);
    });
  }, []);

  const shiftDialog = useCallback((result) => {
    setQueue((prev) => {
      const [current, ...rest] = prev;
      if (current?.resolve) {
        current.resolve(result);
      }
      return rest;
    });
    setInputValue("");
    setInputError("");
    setLoading(false);
  }, []);

  const alert = useCallback(
    (options = {}) => {
      const normalized =
        typeof options === "string" ? { message: options } : options;
      return enqueueDialog({
        type: "alert",
        title: normalized.title ?? "Thông báo",
        message: normalized.message ?? "",
        confirmText: normalized.confirmText ?? "Đã hiểu",
        variant: normalized.variant ?? "info",
        autoClose: normalized.autoClose ?? 0,
        icon: normalized.icon,
      });
    },
    [enqueueDialog]
  );

  const confirm = useCallback(
    (options = {}) => {
      const normalized =
        typeof options === "string" ? { message: options } : options;
      return enqueueDialog({
        type: "confirm",
        title: normalized.title ?? "Xác nhận",
        message: normalized.message ?? "",
        confirmText: normalized.confirmText ?? "Xác nhận",
        cancelText: normalized.cancelText ?? "Hủy bỏ",
        variant: normalized.variant ?? "primary",
        icon: normalized.icon,
        onConfirm: normalized.onConfirm,
        requireInput: Boolean(normalized.requireInput),
        inputLabel: normalized.inputLabel ?? "Nội dung",
        inputPlaceholder: normalized.inputPlaceholder ?? "Nhập nội dung...",
        inputRequiredMessage:
          normalized.inputRequiredMessage ?? "Vui lòng nhập thông tin này.",
        initialValue: normalized.initialValue ?? "",
      });
    },
    [enqueueDialog]
  );

  useEffect(() => {
    if (currentDialog?.type === "confirm" && currentDialog.requireInput) {
      setInputValue(currentDialog.initialValue || "");
      setInputError("");
    }
  }, [currentDialog]);

  const handleConfirmAction = useCallback(async () => {
    if (!currentDialog) return;

    if (currentDialog.type === "alert") {
      shiftDialog(undefined);
      return;
    }

    if (currentDialog.requireInput) {
      const trimmed = inputValue.trim();
      if (!trimmed) {
        setInputError(currentDialog.inputRequiredMessage);
        return;
      }
      if (typeof currentDialog.onConfirm === "function") {
        try {
          setLoading(true);
          await currentDialog.onConfirm(trimmed);
          shiftDialog(trimmed);
        } catch {
          setLoading(false);
        }
      } else {
        shiftDialog(trimmed);
      }
      return;
    }

    if (typeof currentDialog.onConfirm === "function") {
      try {
        setLoading(true);
        await currentDialog.onConfirm();
        shiftDialog(true);
      } catch {
        setLoading(false);
      }
    } else {
      shiftDialog(true);
    }
  }, [currentDialog, inputValue, shiftDialog]);

  const handleCloseAction = useCallback(() => {
    if (!currentDialog || loading) return;
    shiftDialog(currentDialog.type === "confirm" ? false : undefined);
  }, [currentDialog, loading, shiftDialog]);

  const contextValue = useMemo(
    () => ({
      alert,
      confirm,
    }),
    [alert, confirm]
  );

  return (
    <DialogContext.Provider value={contextValue}>
      {children}

      {currentDialog?.type === "alert" && (
        <AlertPopup
          isOpen={true}
          onClose={handleCloseAction}
          onConfirm={handleConfirmAction}
          title={currentDialog.title}
          message={currentDialog.message}
          confirmText={currentDialog.confirmText}
          variant={currentDialog.variant}
          autoClose={currentDialog.autoClose}
          icon={currentDialog.icon}
        />
      )}

      {currentDialog?.type === "confirm" && (
        <ConfirmModal
          isOpen={true}
          onClose={handleCloseAction}
          onConfirm={handleConfirmAction}
          title={currentDialog.title}
          message={currentDialog.message}
          confirmText={currentDialog.confirmText}
          cancelText={currentDialog.cancelText}
          variant={currentDialog.variant}
          icon={currentDialog.icon}
          loading={loading}
        >
          {currentDialog.requireInput && (
            <div className="w-full text-left mt-1">
              <Textarea
                label={currentDialog.inputLabel}
                placeholder={currentDialog.inputPlaceholder}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (inputError) setInputError("");
                }}
                error={inputError}
                rows={3}
              />
            </div>
          )}
        </ConfirmModal>
      )}
    </DialogContext.Provider>
  );
};

export default DialogProvider;
