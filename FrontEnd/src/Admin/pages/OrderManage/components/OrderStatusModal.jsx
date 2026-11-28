import React from "react";
import { User, Check, Lock, CheckCircle2 } from "lucide-react";
import { STATUS_FLOW, ALLOWED_TRANSITIONS } from "../orderConstants";
import { statusMap } from "../../../../utils/StatusMap";
import { StatusBadge } from "../../../../utils/StatusBadge";
import { formatOrderCurrency } from "../hooks/useAdminOrders";
import { Modal, Button } from "../../../../components/UI";

const OrderStatusModal = ({
  statusModal,
  setStatusModal,
  isUpdating,
  onClose,
  onConfirm,
}) => {
  if (!statusModal?.show || !statusModal?.order) return null;

  return (
    <Modal
      isOpen={Boolean(statusModal.show && statusModal.order)}
      onClose={onClose}
      size="lg"
      title="Cập nhật trạng thái"
      subtitle={`Đơn hàng: #${statusModal.order.orderCode}`}
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12 uppercase tracking-wider text-xs"
          >
            Hủy bỏ
          </Button>
          <Button
            type="button"
            variant={
              statusModal.selectedStatus === "cancelled" ? "destructive" : "primary"
            }
            disabled={
              isUpdating ||
              statusModal.selectedStatus === statusModal.order.status
            }
            onClick={onConfirm}
            loading={isUpdating}
            loadingText="Đang cập nhật..."
            icon={CheckCircle2}
            className="flex-1 h-12 uppercase tracking-wider text-xs shadow-lg"
          >
            Xác nhận chuyển
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
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
                              ? "bg-slate-100 dark:bg-dark-card text-slate-600 dark:text-dark-text-secondary"
                              : "bg-slate-100/50 dark:bg-dark-bg/50 text-slate-400"
                      }`}
                    >
                      {React.isValidElement(Icon) ? Icon : (typeof Icon === "function" || Icon?.$$typeof) ? <Icon className="size-4.5" /> : null}
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-black uppercase tracking-tight truncate ${
                          isSelected
                            ? "text-white"
                            : isCurrent
                              ? "text-primary"
                              : "text-slate-800 dark:text-white"
                        }`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`text-[10px] truncate ${
                          isSelected
                            ? "text-white/80"
                            : "text-slate-400 dark:text-dark-text-secondary"
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    {isSelected && (
                      <div className="size-6 rounded-full bg-white text-primary flex items-center justify-center text-xs shadow-sm">
                        <Check className="size-3.5 stroke-[3]" />
                      </div>
                    )}
                    {isCurrent && !isSelected && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                        Hiện tại
                      </span>
                    )}
                    {!isValid && !isCurrent && (
                      <Lock className="size-3.5 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {statusModal.selectedStatus === "cancelled" && (
          <div className="space-y-1.5 animate-in fade-in duration-200">
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
    </Modal>
  );
};

export default OrderStatusModal;
