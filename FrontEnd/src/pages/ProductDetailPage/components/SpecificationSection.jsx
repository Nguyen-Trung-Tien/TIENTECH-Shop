import React from "react";
import { FiCpu, FiCheckCircle } from "react-icons/fi";

const SpecificationSection = ({ mergedSpecs, displayVariant }) => {
  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <span className="w-6 h-[2px] bg-blue-600 rounded-full"></span>
          Thông Số Kỹ Thuật Chi Tiết
        </h3>
        {displayVariant && (
          <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <FiCheckCircle size={12} /> Cấu hình SKU: {displayVariant.sku?.split("-")[0]}
          </span>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900/80 shadow-sm">
        {mergedSpecs.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mergedSpecs.map((spec, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center py-3.5 px-6 text-xs transition-colors hover:bg-blue-50/30 dark:hover:bg-blue-950/20 ${
                  idx % 2 === 0 ? "bg-slate-50/50 dark:bg-slate-900/40" : "bg-white dark:bg-slate-900"
                }`}
              >
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shrink-0">
                    {spec.icon}
                  </span>
                  {spec.name}
                </span>
                <span className="text-slate-900 dark:text-white font-extrabold text-right ml-4">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
            <div className="size-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 shadow-inner">
              <FiCpu size={28} />
            </div>
            <p className="text-xs text-slate-400 font-medium italic max-w-xs leading-relaxed">
              {displayVariant
                ? "Phiên bản này đang được bổ sung thông số..."
                : "Vui lòng chọn phiên bản sản phẩm để xem cấu hình chi tiết."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SpecificationSection);
