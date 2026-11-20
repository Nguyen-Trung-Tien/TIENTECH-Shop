import React from "react";
import { Trash2, CheckCircle2, XCircle, Ban } from "lucide-react";
import { Modal, Button, ConfirmModal } from "../../../../components/UI";
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

      <Modal
        isOpen={Boolean(confirmModal.show && confirmModal.type === "process_return")}
        onClose={onClose}
        size="md"
        title={`Xử lý trả hàng #${confirmModal.orderCode}`}
        subtitle="Duyệt nhập kho và hoàn tiền cho khách"
        footer={
          <div className="flex gap-2.5 w-full">
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => onConfirmAction("reject_return")}
              className="flex-1 h-11 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40 hover:bg-rose-600 hover:text-white"
              icon={<XCircle className="size-4" />}
            >
              Từ chối trả
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isDeleting}
              onClick={() => onConfirmAction("approve_return")}
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
              icon={<CheckCircle2 className="size-4" />}
            >
              Duyệt trả (Nhập kho)
            </Button>
          </div>
        }
      >
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto custom-scrollbar">
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
      </Modal>
    </>
  );
};

export default OrderActionModals;
