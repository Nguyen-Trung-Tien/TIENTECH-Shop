import React from "react";
import { FiAlertTriangle } from "react-icons/fi";
import { ConfirmModal } from "../../../components/UI";
import { motion as Motion } from "framer-motion";

const CANCEL_REASONS = [
  "Thay đổi ý định mua hàng",
  "Tìm thấy giá rẻ hơn ở nơi khác",
  "Đặt nhầm sản phẩm",
  "Phí vận chuyển quá cao",
  "Thời gian giao hàng quá lâu",
  "Lý do khác",
];

const CancelModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCancelReason,
  cancelReason,
  submitting,
  onSelectReason,
  onChangeCustomReason,
}) => {
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Hủy đơn hàng?"
      confirmText="Xác nhận hủy"
      variant="danger"
      loading={submitting}
      icon={FiAlertTriangle}
    >
      <div className="mb-6 text-left w-full space-y-4">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mb-1.5 block">
            Chọn lý do hủy đơn
          </p>
          <div className="grid grid-cols-1 gap-2">
            {CANCEL_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => onSelectReason(reason)}
                className={`px-4 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                  selectedCancelReason === reason
                    ? "bg-primary/5 dark:bg-brand/10 border-primary dark:border-brand text-primary dark:text-brand shadow-sm"
                    : "bg-slate-50 dark:bg-dark-bg border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text-secondary hover:border-slate-300 dark:hover:border-dark-text-secondary"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>

        {selectedCancelReason === "Lý do khác" && (
          <Motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <label
              className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-widest mb-1.5 block"
              htmlFor="cancelReason"
            >
              Nhập lý do chi tiết
            </label>
            <textarea
              id="cancelReason"
              rows={3}
              className="w-full bg-white dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl p-3 text-xs dark:text-white focus:ring-2 focus:ring-primary/10 dark:focus:ring-brand/10 focus:border-primary dark:focus:border-brand outline-none transition-all"
              placeholder="Vui lòng nhập lý do cụ thể..."
              value={cancelReason}
              onChange={(e) => onChangeCustomReason(e.target.value)}
            />
          </Motion.div>
        )}
      </div>
    </ConfirmModal>
  );
};

export default CancelModal;
