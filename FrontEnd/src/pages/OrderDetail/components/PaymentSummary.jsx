import React from "react";
import { FiCreditCard, FiRefreshCcw } from "react-icons/fi";
import { StatusBadge } from "../../../utils/StatusBadge";
import { paymentStatusMap } from "../../../utils/constants";
import { formatCurrency } from "../../../utils/format";
import { Button } from "../../../components/UI";

const PaymentSummary = ({ order, onRepay }) => {
  if (!order) return null;

  return (
    <div className="bg-white dark:bg-dark-surface p-8 rounded-[32px] border border-surface-200 dark:border-dark-border shadow-xl print:border print:shadow-none print:avoid-break">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
        <FiCreditCard className="text-primary" /> Thanh toán
      </h3>
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center text-sm font-medium">
          <span className="text-slate-500 dark:text-dark-text-secondary">
            Phương thức
          </span>
          <span className="text-slate-900 dark:text-white uppercase font-bold tracking-widest">
            {order.paymentMethod}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm font-medium">
          <span className="text-slate-500 dark:text-dark-text-secondary">
            Trạng thái
          </span>
          <StatusBadge
            map={paymentStatusMap}
            status={order.paymentStatus}
          />
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between items-center text-rose-500 text-sm font-bold">
            <span>Giảm giá</span>
            <span>-{formatCurrency(order.discountAmount)}</span>
          </div>
        )}
      </div>
      <div className="pt-6 border-t border-slate-100 dark:border-dark-border text-center md:text-left">
        <p className="text-[10px] font-black text-slate-400 dark:text-dark-text-secondary uppercase tracking-[0.2em] mb-2">
          Tổng thanh toán
        </p>
        <div className="text-3xl font-black tracking-tight text-primary">
          {formatCurrency(order.totalPrice)}
        </div>
      </div>
      {order.paymentStatus === "unpaid" &&
        order.paymentMethod === "VNPAY" && (
          <Button
            variant="primary"
            className="w-full mt-6"
            icon={FiRefreshCcw}
            onClick={onRepay}
          >
            THANH TOÁN LẠI
          </Button>
        )}
    </div>
  );
};

export default PaymentSummary;
