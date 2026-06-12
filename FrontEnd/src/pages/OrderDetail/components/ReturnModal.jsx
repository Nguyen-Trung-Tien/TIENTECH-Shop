import React from "react";
import { FiRotateCcw } from "react-icons/fi";
import { ConfirmModal } from "../../../components/UI";
import { formatCurrency } from "../../../utils/format";

const RETURN_REASONS = [
  "Sản phẩm bị lỗi/hỏng",
  "Giao sai sản phẩm",
  "Sản phẩm không giống mô tả",
  "Không còn nhu cầu sử dụng",
  "Lý do khác",
];

const ReturnModal = ({
  isOpen,
  onClose,
  onConfirm,
  order,
  selectedItems,
  returnReason,
  submitting,
  onToggleItem,
  onSetReturnReason,
}) => {
  if (!order) return null;

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Yêu cầu trả hàng"
      confirmText="Gửi yêu cầu ngay"
      variant="primary"
      loading={submitting}
      icon={FiRotateCcw}
      iconClassName="bg-amber-50 text-amber-500 border-amber-100"
    >
      <div className="mb-6 text-left w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-[0.2em]">
              Chọn sản phẩm muốn trả
            </p>
            <p className="text-[10px] font-bold text-primary dark:text-brand bg-primary/5 dark:bg-brand/10 px-2 py-1 rounded-lg">
              {selectedItems.length} sản phẩm đã chọn
            </p>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {order.orderItems
              ?.filter(
                (item) => !item.returnStatus || item.returnStatus === "none",
              )
              .map((item) => (
                <label
                  key={item.id}
                  className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedItems.includes(item.id)
                      ? "bg-primary/5 dark:bg-brand/10 border-primary dark:border-brand shadow-sm"
                      : "bg-white dark:bg-dark-bg border-slate-100 dark:border-dark-border hover:border-slate-200 dark:hover:border-dark-text-secondary"
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      className="peer size-5 rounded-lg border-slate-200 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => onToggleItem(item.id)}
                    />
                  </div>
                  <div className="size-12 rounded-xl bg-slate-50 dark:bg-dark-surface p-1 border border-slate-100 dark:border-dark-border flex-shrink-0 group-hover:scale-110 transition-transform">
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-bold text-slate-700 dark:text-white truncate block">
                      {item.productName}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Số lượng: {item.quantity} • {formatCurrency(item.price)}
                    </span>
                  </div>
                </label>
              ))}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-[0.2em]">
            Lý do trả hàng <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {RETURN_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => onSetReturnReason(reason)}
                className={`px-4 py-3 rounded-xl text-left text-[11px] font-bold transition-all border ${
                  returnReason === reason
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                    : "bg-slate-50 dark:bg-dark-bg border-slate-100 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary hover:border-slate-200"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
          <div className="relative">
            <textarea
              rows={3}
              className="w-full bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-2xl p-4 text-sm font-medium dark:text-white outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/40 transition-all placeholder:text-slate-300 resize-none"
              placeholder="Vui lòng cung cấp thêm thông tin chi tiết về tình trạng sản phẩm..."
              value={returnReason}
              onChange={(e) => onSetReturnReason(e.target.value)}
            />
            <div className="absolute bottom-3 right-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Bắt buộc
            </div>
          </div>
        </div>
      </div>
    </ConfirmModal>
  );
};

export default ReturnModal;
