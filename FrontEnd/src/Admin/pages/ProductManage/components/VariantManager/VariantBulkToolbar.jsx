import React, { useState } from "react";
import { FiDollarSign, FiBox, FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";

const VariantBulkToolbar = ({ variantsCount, onApplyBulk }) => {
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const handleApply = () => {
    if (!bulkPrice && !bulkStock) {
      toast.warning("Vui lòng nhập Giá chung hoặc Tồn kho chung để áp dụng!");
      return;
    }

    onApplyBulk({
      price: bulkPrice !== "" ? Number(bulkPrice) : undefined,
      stock: bulkStock !== "" ? Number(bulkStock) : undefined,
    });

    toast.success(`Đã áp dụng Giá & Kho cho tất cả ${variantsCount} biến thể! 🎉`);
  };

  return (
    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-amber-600 dark:text-amber-400 text-lg">⚡</span>
        <div>
          <h5 className="text-xs font-black uppercase text-amber-900 dark:text-amber-300">
            Sửa nhanh hàng loạt ({variantsCount} biến thể)
          </h5>
          <p className="text-[10px] text-amber-700/80 dark:text-amber-400">
            Nhập giá/kho đồng loạt để áp dụng cho tất cả phiên bản trong 1 giây.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-32">
          <FiDollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="number"
            min="0"
            className="input-modern h-9 pl-7 text-xs font-bold bg-white dark:bg-dark-bg border-amber-200"
            placeholder="Giá chung..."
            value={bulkPrice}
            onChange={(e) => setBulkPrice(e.target.value)}
          />
        </div>

        <div className="relative w-28">
          <FiBox className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="number"
            min="0"
            className="input-modern h-9 pl-7 text-xs font-bold bg-white dark:bg-dark-bg border-amber-200"
            placeholder="Kho..."
            value={bulkStock}
            onChange={(e) => setBulkStock(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={handleApply}
          className="h-9 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 shrink-0"
        >
          <FiCheckCircle /> Áp dụng tất cả
        </button>
      </div>
    </div>
  );
};

export default VariantBulkToolbar;
