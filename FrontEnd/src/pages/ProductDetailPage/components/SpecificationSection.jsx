import React from "react";
import { FiCpu, FiCheckCircle } from "react-icons/fi";

const SpecificationSection = ({ mergedSpecs, displayVariant }) => {
  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-3">
        <div className="tt-eyebrow">
          <span className="size-1.5 rounded-full bg-lime-500"></span>
          <span>HARDWARE SPECIFICATION SHEET</span>
        </div>
        {displayVariant && (
          <span className="text-[10px] font-mono font-bold text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-800 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
            <FiCheckCircle size={11} /> SKU: {displayVariant.sku?.split("-")[0]}
          </span>
        )}
      </div>

      <div className="tt-card overflow-hidden bg-white dark:bg-dark-surface border border-slate-200 dark:border-slate-800">
        {mergedSpecs.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mergedSpecs.map((spec, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center py-3 px-4 sm:px-6 text-xs transition-colors ${
                  idx % 2 === 0 ? "bg-slate-50/50 dark:bg-slate-900/30" : "bg-white dark:bg-dark-surface"
                }`}
              >
                <span className="text-slate-500 dark:text-slate-400 font-mono font-semibold uppercase tracking-wider flex items-center gap-2.5 min-w-0">
                  <span className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0 text-sm">
                    {spec.icon}
                  </span>
                  <span className="truncate">{spec.name}</span>
                </span>
                <span className="text-slate-900 dark:text-white font-mono font-bold text-right ml-4 break-words">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
            <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-400">
              <FiCpu size={20} />
            </div>
            <p className="text-xs text-slate-400 font-mono italic">
              {displayVariant
                ? "THÔNG SỐ SKU ĐANG ĐƯỢC CẬP NHẬT..."
                : "VUI LÒNG CHỌN PHIÊN BẢN ĐỂ XEM CẤU HÌNH CHI TIẾT"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SpecificationSection);
