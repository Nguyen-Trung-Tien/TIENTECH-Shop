import React from "react";
import { m as Motion, AnimatePresence } from "framer-motion";
import { Printer, X, AlertTriangle } from "lucide-react";
import {
  STATUS_LABELS,
  METHOD_BADGE,
  formatPaymentTxnCode,
} from "./paymentConstants";

const PaymentModals = ({
  selectedPayment,
  onCloseDetail,
  onRefundFromDetail,
  actionModal,
  onCloseActionModal,
  onConfirmAction,
  refundNote,
  setRefundNote,
  transactionCodeInput,
  setTransactionCodeInput,
  isRefundAction,
  isCompleteAction,
}) => {
  return (
    <>
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseDetail}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity print:hidden"
            />
            <Motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="payment-receipt-modal-title"
              initial={{ opacity: 0, y: 60, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 60, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="relative w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-white dark:bg-dark-surface rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200/80 dark:border-dark-border print:shadow-none print:border-none print:w-full"
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden bg-slate-50/80 dark:bg-dark-bg/60 print:hidden">
                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-dark-border" />
              </div>

              <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-dark-border flex items-center justify-between">
                <h3
                  id="payment-receipt-modal-title"
                  className="text-xl font-black text-slate-900 dark:text-dark-text-primary tracking-tight"
                >
                  Biên Lai Giao Dịch #
                  {selectedPayment.order?.orderCode || selectedPayment.id}
                </h3>
                <div className="flex items-center gap-3 print:hidden">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="size-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer"
                    title="In biên lai"
                    aria-label="In biên lai"
                  >
                    <Printer className="size-4.5" />
                  </button>
                  <button
                    type="button"
                    onClick={onCloseDetail}
                    aria-label="Đóng biên lai"
                    className="size-10 rounded-2xl bg-slate-50 dark:bg-dark-bg flex items-center justify-center text-slate-400 dark:text-dark-text-secondary hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 sm:p-10 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 overflow-y-auto custom-scrollbar">
                <div className="space-y-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                    Khách hàng
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-dark-text-primary break-words [overflow-wrap:anywhere]">
                    {selectedPayment.user?.username || "—"}
                  </p>
                </div>
                <div className="space-y-1 sm:text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                    Số tiền
                  </p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {Number(selectedPayment.amount).toLocaleString("vi-VN")} ₫
                  </p>
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                    Email
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-dark-text-primary break-words [overflow-wrap:anywhere]">
                    {selectedPayment.user?.email || "—"}
                  </p>
                </div>
                <div className="space-y-1 sm:text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                    Phương thức
                  </p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${METHOD_BADGE[selectedPayment.method] || ""}`}
                  >
                    {selectedPayment.method}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                    Trạng thái
                  </p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${STATUS_LABELS[selectedPayment.status]?.class || ""}`}
                  >
                    {STATUS_LABELS[selectedPayment.status]?.text || selectedPayment.status}
                  </span>
                </div>
                <div className="space-y-1 sm:text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                    Ngày tạo
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-dark-text-primary">
                    {new Date(selectedPayment.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="sm:col-span-2 space-y-1 pt-4 border-t border-slate-50 dark:border-dark-border min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                    Mã giao dịch
                  </p>
                  <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-xl break-all">
                    {formatPaymentTxnCode(selectedPayment)}
                  </p>
                </div>
                {selectedPayment.status === "refunded" && (
                  <div className="sm:col-span-2 space-y-1 pt-4 border-t border-slate-50 dark:border-dark-border min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                      Ghi chú hoàn tiền
                    </p>
                    <p className="text-sm font-bold text-slate-600 dark:text-dark-text-primary italic break-words [overflow-wrap:anywhere]">
                      &ldquo;{selectedPayment.refundNote || "Không có ghi chú"}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 bg-slate-50 dark:bg-dark-bg flex justify-end gap-3 print:hidden">
                {selectedPayment.status === "completed" && (
                  <button
                    type="button"
                    onClick={() => onRefundFromDetail(selectedPayment.id)}
                    className="px-6 py-3 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    Hoàn tiền
                  </button>
                )}
                <button
                  type="button"
                  onClick={onCloseDetail}
                  className="px-8 py-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {actionModal.show && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 print:hidden">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseActionModal}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <Motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="payment-action-modal-title"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-dark-surface rounded-[32px] p-8 shadow-2xl border border-slate-100 dark:border-dark-border text-center"
            >
              <div className="size-20 bg-rose-50 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-6">
                <AlertTriangle className="size-10" />
              </div>
              <h3
                id="payment-action-modal-title"
                className="text-xl font-black text-slate-900 dark:text-dark-text-primary mb-2"
              >
                Xác nhận hành động
              </h3>
              <p className="text-slate-500 dark:text-dark-text-secondary font-medium mb-8">
                {actionModal.message}
              </p>

              {isRefundAction && (
                <div className="mb-8 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary ml-2 mb-2 block">
                    Lý do hoàn tiền
                  </label>
                  <textarea
                    value={refundNote}
                    onChange={(e) => setRefundNote(e.target.value)}
                    placeholder="Nhập lý do hoàn tiền..."
                    className="w-full h-24 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all resize-none text-slate-900 dark:text-dark-text-primary"
                  />
                </div>
              )}

              {isCompleteAction && (
                <div className="mb-8 text-left">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary ml-2 mb-2 block">
                    Mã giao dịch (Nếu có)
                  </label>
                  <input
                    type="text"
                    value={transactionCodeInput}
                    onChange={(e) => setTransactionCodeInput(e.target.value)}
                    placeholder="Nhập mã giao dịch..."
                    className="w-full h-12 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl px-4 text-sm font-bold focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all text-slate-900 dark:text-dark-text-primary"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={onCloseActionModal}
                  className="h-14 bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-text-secondary rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-dark-surface transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={onConfirmAction}
                  className="h-14 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  Xác nhận
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PaymentModals;
