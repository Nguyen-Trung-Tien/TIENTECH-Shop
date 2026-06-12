import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

const CancellationReason = ({ isCancelled, cancelReason }) => {
  if (!isCancelled || !cancelReason) return null;

  return (
    <div className="mb-10 p-6 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-[32px] flex items-start gap-4">
      <div className="size-12 bg-rose-100 dark:bg-rose-900/40 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
        <FiAlertTriangle size={24} />
      </div>
      <div>
        <h4 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">
          Lý do hủy đơn
        </h4>
        <p className="text-rose-700 dark:text-rose-300 font-medium italic">
          "{cancelReason}"
        </p>
      </div>
    </div>
  );
};

export default CancellationReason;
