import React from "react";
import { m as Motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, X, User, Check, Lock, CheckCircle2, RefreshCw } from "lucide-react";
import { STATUS_FLOW, ALLOWED_TRANSITIONS } from "../orderConstants";
import { statusMap } from "../../../../utils/StatusMap";
import { StatusBadge } from "../../../../utils/StatusBadge";
import { formatOrderCurrency } from "../hooks/useAdminOrders";

const OrderStatusModal = ({
  statusModal,
  setStatusModal,
  isUpdating,
  onClose,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {statusModal.show && statusModal.order && (
        <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
          />

          <Motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-status-modal-title"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative bg-white dark:bg-dark-surface rounded-t-[32px] sm:rounded-[32px] shadow-2xl max-w-lg w-full max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden border border-slate-200/80 dark:border-dark-border transition-colors duration-300 z-10 text-left"
          >
            <div className="flex justify-center pt-3 pb-1 sm:hidden bg-slate-50/80 dark:bg-dark-bg/60 shrink-0">
              <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            <div className="flex items-center justify-between p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-dark-border shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <RefreshCcw className="size-4" />
                  </div>
                  <h3
                    id="order-status-modal-title"
                    className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight"
                  >
                    Cập nhật trạng thái
                  </h3>
                </div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-dark-text-secondary mt-1">
                  Đơn hàng:{" "}
                  <span className="text-primary font-black uppercase">
                    #{statusModal.order.orderCode}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng hộp thoại cập nhật trạng thái"
                className="size-9 bg-slate-100 dark:bg-dark-bg hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <X className="size-4.5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 flex-1 overflow-y-auto custom-scrollbar space-y-5">
              <div className="bg-slate-50 dark:bg-dark-bg/60 p-4 rounded-2xl border border-slate-100 dark:border-dark-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 bg-white dark:bg-dark-surface rounded-xl flex items-center justify-center text-slate-400 dark:text-dark-text-secondary border border-slate-100 dark:border-dark-border shrink-0">
                    <User className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {statusModal.order.user?.username || "Ẩn danh"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {statusModal.order.user?.phone || "Không có SĐT"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-rose-600">
                    {formatOrderCurrency(statusModal.order.totalPrice)}
                  </p>
                  <StatusBadge
                    map={statusMap}
                    status={statusModal.order.status}
                    className="text-[9px] px-2 py-0.5 mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary block mb-3">
                  Chọn trạng thái mới
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {STATUS_FLOW.map((item) => {
                    const isCurrent = statusModal.order.status === item.key;
                    const isValid = ALLOWED_TRANSITIONS[
                      statusModal.order.status
                    ]?.includes(item.key);
                    const isSelected = statusModal.selectedStatus === item.key;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        disabled={isCurrent || !isValid}
                        onClick={() =>
                          setStatusModal((prev) => ({
                            ...prev,
                            selectedStatus: item.key,
                          }))
                        }
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                          isCurrent
                            ? "bg-primary/10 border-primary/30 opacity-90 cursor-default"
                            : isSelected
                              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.01] cursor-pointer"
                              : isValid
                                ? "bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border hover:border-primary/50 text-slate-700 dark:text-dark-text-secondary cursor-pointer"
                                : "bg-slate-50 dark:bg-dark-bg/30 border-slate-100 dark:border-dark-border/40 text-slate-300 dark:text-slate-600 opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`size-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : isCurrent
                                  ? "bg-primary text-white"
                                  : isValid
                                    ? "bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary"
                                    : "bg-slate-100 dark:bg-dark-bg/50 text-slate-300 dark:text-slate-600"
                            }`}
                          >
                            <Icon />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-xs font-black uppercase tracking-wider truncate ${
                                  isSelected
                                    ? "text-white"
                                    : "text-slate-900 dark:text-white"
                                }`}
                              >
                                {item.label}
                              </p>
                              {isCurrent && (
                                <span className="text-[9px] font-black bg-primary text-white px-2 py-0.5 rounded-md shrink-0">
                                  Hiện tại
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[10px] font-medium truncate mt-0.5 ${
                                isSelected
                                  ? "text-white/80"
                                  : "text-slate-400 dark:text-dark-text-secondary"
                              }`}
                            >
                              {isCurrent
                                ? "Đơn hàng đang ở trạng thái này"
                                : isValid
                                  ? item.desc
                                  : "Không thể chuyển sang trạng thái này"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isSelected && !isCurrent ? (
                            <div className="size-6 rounded-full bg-white text-primary flex items-center justify-center text-xs font-black shadow-sm">
                              <Check className="size-3.5" />
                            </div>
                          ) : !isValid && !isCurrent ? (
                            <Lock className="text-slate-300 dark:text-slate-600 size-3.5" />
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {statusModal.selectedStatus === "cancelled" && (
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[11px] font-black uppercase tracking-widest text-rose-500 block">
                    Lý do hủy đơn hàng
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Nhập lý do hủy đơn (ví dụ: Hết hàng, Khách đổi ý...)"
                    value={statusModal.reason}
                    onChange={(e) =>
                      setStatusModal((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl p-3 text-xs font-medium focus:ring-2 focus:ring-rose-500/20 outline-none transition-all dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/40 flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-12 rounded-2xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary text-xs font-black uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={
                  isUpdating ||
                  statusModal.selectedStatus === statusModal.order.status
                }
                onClick={onConfirm}
                className={`flex-1 h-12 rounded-2xl text-xs font-black uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                  statusModal.selectedStatus === statusModal.order.status
                    ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none"
                    : statusModal.selectedStatus === "cancelled"
                      ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20 cursor-pointer active:scale-95"
                      : "bg-primary hover:bg-primary-hover shadow-primary/20 cursor-pointer active:scale-95"
                }`}
              >
                {isUpdating ? (
                  <RefreshCw className="animate-spin size-4" />
                ) : (
                  <>
                    <CheckCircle2 className="size-4" /> Xác nhận chuyển
                  </>
                )}
              </button>
            </div>
          </Motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default OrderStatusModal;
