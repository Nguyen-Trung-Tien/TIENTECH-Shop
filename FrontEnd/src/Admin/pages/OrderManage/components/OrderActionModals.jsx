import React from "react";
import { Trash2, CheckCircle2, XCircle, Ban, RotateCcw, X } from "lucide-react";
import { ConfirmModal } from "../../../../components/UI/Modal";
import { formatOrderCurrency } from "../hooks/useAdminOrders";

const OrderActionModals = ({
  confirmModal,
  setConfirmModal,
  isDeleting,
  onClose,
  onConfirmAction,
}) => {
  return (
    <>
      <ConfirmModal
        isOpen={confirmModal.show && confirmModal.type === "delete"}
        onClose={onClose}
        onConfirm={() => onConfirmAction("delete")}
        title="Xác nhận xóa đơn hàng?"
        message={`Hành động này sẽ gỡ bỏ đơn hàng #${confirmModal.orderCode || `DH${confirmModal.orderId}`} vĩnh viễn khỏi hệ thống. Bạn có chắc chắn?`}
        confirmText="Đồng ý xóa"
        variant="danger"
        icon={Trash2}
        iconClassName="bg-rose-50 text-rose-500"
        loading={isDeleting}
      />

      <ConfirmModal
        isOpen={confirmModal.show && confirmModal.type === "approve_cancel"}
        onClose={onClose}
        onConfirm={() => onConfirmAction("approve_cancel")}
        title="Duyệt yêu cầu hủy đơn?"
        message={`Bạn có đồng ý chấp nhận hủy đơn hàng #${confirmModal.orderCode}? Hệ thống sẽ hoàn lại số lượng tồn kho cho các sản phẩm trong đơn.`}
        confirmText="Duyệt hủy (Hoàn kho)"
        variant="danger"
        icon={CheckCircle2}
        loading={isDeleting}
      >
        <div className="w-full bg-slate-50 dark:bg-dark-bg/60 p-3 rounded-xl border border-slate-200 dark:border-dark-border text-left mb-2">
          <p className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-text-secondary tracking-wider mb-1">
            Lý do từ khách hàng:
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold italic break-words [overflow-wrap:anywhere]">
            &ldquo;{confirmModal.order?.cancelReason || "Khách không để lại lý do"}&rdquo;
          </p>
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={confirmModal.show && confirmModal.type === "reject_cancel"}
        onClose={onClose}
        onConfirm={() => onConfirmAction("reject_cancel")}
        title="Từ chối yêu cầu hủy đơn?"
        message={`Đơn hàng #${confirmModal.orderCode} sẽ được chuyển về trạng thái "Đã xác nhận" để tiếp tục giao dịch.`}
        confirmText="Xác nhận từ chối"
        variant="primary"
        icon={XCircle}
        loading={isDeleting}
      >
        <div className="w-full text-left space-y-1.5 mb-2">
          <label className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-text-secondary tracking-wider block">
            Ghi chú / Lý do từ chối:
          </label>
          <input
            type="text"
            placeholder="Nhập lý do gửi đến khách..."
            value={confirmModal.reason || ""}
            onChange={(e) =>
              setConfirmModal((prev) => ({ ...prev, reason: e.target.value }))
            }
            className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={confirmModal.show && confirmModal.type === "admin_cancel"}
        onClose={onClose}
        onConfirm={() => onConfirmAction("admin_cancel")}
        title={`Admin hủy đơn #${confirmModal.orderCode}`}
        message="Hành động này sẽ hủy đơn hàng và hoàn lại tồn kho. Vui lòng nhập lý do hủy đơn hàng:"
        confirmText="Xác nhận hủy đơn"
        variant="danger"
        icon={Ban}
        loading={isDeleting}
      >
        <div className="w-full text-left space-y-1.5 mb-2">
          <label className="text-[10px] font-black uppercase text-rose-500 tracking-wider block">
            Lý do hủy đơn hàng (bắt buộc):
          </label>
          <textarea
            rows={2}
            placeholder="Ví dụ: Hết hàng, Khách gọi điện yêu cầu hủy, Sai thông tin giá..."
            value={confirmModal.reason || ""}
            onChange={(e) =>
              setConfirmModal((prev) => ({ ...prev, reason: e.target.value }))
            }
            className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>
      </ConfirmModal>

      {confirmModal.show && confirmModal.type === "process_return" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-return-modal-title"
          className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white dark:bg-dark-surface rounded-3xl border border-slate-200 dark:border-dark-border w-full max-w-lg p-5 sm:p-6 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <RotateCcw className="size-4.5" />
                </div>
                <div className="min-w-0">
                  <h3
                    id="order-return-modal-title"
                    className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate"
                  >
                    Xử lý trả hàng #{confirmModal.orderCode}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Duyệt nhập kho và hoàn tiền cho khách
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng hộp thoại xử lý trả hàng"
                className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors cursor-pointer shrink-0"
              >
                <X className="size-4.5" />
              </button>
            </div>

            <div className="py-4 space-y-2.5 max-h-[40vh] overflow-y-auto custom-scrollbar">
              {confirmModal.order?.orderItems
                ?.filter((item) => item.returnStatus === "requested")
                ?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 dark:bg-dark-bg/60 rounded-2xl border border-slate-100 dark:border-dark-border flex items-start gap-3"
                  >
                    <div className="size-11 bg-white dark:bg-dark-surface rounded-xl p-1 border border-slate-100 dark:border-dark-border shrink-0 overflow-hidden">
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        SL: <span className="text-primary font-black">x{item.quantity}</span>{" "}
                        • {formatOrderCurrency(item.price)}
                      </p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 font-medium italic mt-1.5 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/60 dark:border-amber-900/30 break-words [overflow-wrap:anywhere]">
                        Lý do: &ldquo;{item.returnReason || "Khách hàng không nêu lý do"}&rdquo;
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-slate-100 dark:border-dark-border">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => onConfirmAction("reject_return")}
                className="flex-1 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-600 hover:text-white transition-all text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <XCircle className="size-4" /> Từ chối trả
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => onConfirmAction("approve_return")}
                className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                <CheckCircle2 className="size-4" /> Duyệt trả (Nhập kho)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderActionModals;
