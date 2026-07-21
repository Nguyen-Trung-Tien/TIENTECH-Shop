import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import { StatusBadge } from "../../../utils/StatusBadge";
import { orderStatusMap, paymentStatusMap } from "../../../utils/constants";
import { formatDate } from "../../../utils/format";

const OrderDetailHeader = ({
  orderCode,
  createdAt,
  status,
  paymentStatus,
  submitting,
  onBack,
  backText,
}) => {
  return (
    <>
      {/* Navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-surface-400 dark:text-dark-text-secondary hover:text-primary transition-colors mb-8 font-bold text-[13px] uppercase tracking-widest print:hidden"
      >
        <FiArrowLeft size={18} /> Quay lại {backText}
      </button>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white uppercase tracking-tight">
              Chi tiết Đơn hàng
            </h1>
            <span className="px-4 py-1.5 bg-primary text-white text-sm font-black rounded-xl shadow-lg shadow-primary/20">
              #{orderCode}
            </span>
          </div>
          <p className="text-surface-500 dark:text-dark-text-secondary font-medium">
            Ngày đặt: {formatDate(createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge
            map={orderStatusMap}
            status={status}
            loading={submitting}
          />
          <StatusBadge map={paymentStatusMap} status={paymentStatus} />
        </div>
      </div>
    </>
  );
};

export default OrderDetailHeader;
