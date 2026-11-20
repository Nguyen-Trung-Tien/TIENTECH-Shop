import React from "react";
import { Printer, AlertTriangle } from "lucide-react";
import {
  STATUS_LABELS,
  METHOD_BADGE,
  formatPaymentTxnCode,
} from "./paymentConstants";
import { Modal, Button, Textarea, Input } from "../../../../components/UI";

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
  actionLoading = false,
}) => {
  return (
    <>
      {/* Transaction Receipt Modal */}
      <Modal
        isOpen={Boolean(selectedPayment)}
        onClose={onCloseDetail}
        size="2xl"
        title={
          selectedPayment
            ? `Biên Lai Giao Dịch #${selectedPayment.order?.orderCode || selectedPayment.id}`
            : "Biên Lai Giao Dịch"
        }
        subtitle="Chứng từ giao dịch điện tử & kiểm toán dòng tiền"
        className="print:p-0"
        bodyClassName="p-0"
      >
        {selectedPayment && (
          <div className="flex flex-col">
            <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 overflow-y-auto custom-scrollbar">
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

              <div className="sm:col-span-2 space-y-1 pt-4 border-t border-slate-100 dark:border-dark-border min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-dark-text-secondary">
                  Mã giao dịch
                </p>
                <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-xl break-all">
                  {formatPaymentTxnCode(selectedPayment)}
                </p>
              </div>

              {selectedPayment.status === "refunded" && (
                <div className="sm:col-span-2 space-y-1 pt-4 border-t border-slate-100 dark:border-dark-border min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                    Ghi chú hoàn tiền
                  </p>
                  <p className="text-sm font-bold text-slate-600 dark:text-dark-text-primary italic break-words [overflow-wrap:anywhere]">
                    &ldquo;{selectedPayment.refundNote || "Không có ghi chú"}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-dark-bg border-t border-slate-100 dark:border-dark-border flex items-center justify-between gap-3 print:hidden">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={<Printer className="size-4" />}
                onClick={() => window.print()}
              >
                In biên lai
              </Button>

              <div className="flex items-center gap-3">
                {selectedPayment.status === "completed" && (
                  <Button
                    type="button"
                    variant="warning"
                    size="sm"
                    onClick={() => onRefundFromDetail(selectedPayment.id)}
                  >
                    Hoàn tiền
                  </Button>
                )}
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={onCloseDetail}
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Action Modal (Refund / Confirm Complete) */}
      <Modal
        isOpen={Boolean(actionModal?.show)}
        onClose={onCloseActionModal}
        size="md"
        title="Xác nhận hành động"
        subtitle="Vui lòng kiểm tra kỹ trước khi xác nhận thao tác tài chính"
      >
        <div className="space-y-6 text-center">
          <div className="size-16 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
            <AlertTriangle className="size-8" />
          </div>

          <p className="text-slate-600 dark:text-dark-text-secondary font-bold text-sm">
            {actionModal?.message}
          </p>

          {isRefundAction && (
            <div className="text-left space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary">
                Lý do hoàn tiền *
              </label>
              <Textarea
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value)}
                placeholder="Nhập lý do hoàn tiền..."
                rows={3}
                required
              />
            </div>
          )}

          {isCompleteAction && (
            <div className="text-left space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-dark-text-secondary">
                Mã giao dịch (Nếu có)
              </label>
              <Input
                type="text"
                value={transactionCodeInput}
                onChange={(e) => setTransactionCodeInput(e.target.value)}
                placeholder="Nhập mã giao dịch..."
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onCloseActionModal}
              disabled={actionLoading}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant={isRefundAction ? "destructive" : "primary"}
              onClick={onConfirmAction}
              loading={actionLoading}
              disabled={actionLoading}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PaymentModals;
