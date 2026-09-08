import React from "react";
import { FiCpu, FiCheckCircle } from "react-icons/fi";

const SpecificationSection = ({ mergedSpecs, displayVariant }) => {
  return (
    <div className="pt-3">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 flex items-center justify-center text-xs">
            <FiCpu />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Thông số kỹ thuật
          </h3>
        </div>
        {displayVariant && (
          <span className="text-xs font-medium text-primary dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <FiCheckCircle size={12} /> Phiên bản: {displayVariant.name || displayVariant.sku?.split("-")[0]}
          </span>
        )}
      </div>

      <div className="rounded-2xl overflow-hidden bg-white dark:bg-dark-surface border border-slate-100 dark:border-slate-800 shadow-xs">
        {mergedSpecs.length > 0 ? (
          <div className="divide-y divide-slate-100/80 dark:divide-slate-800/80">
            {mergedSpecs.map((spec, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center py-3.5 px-4 sm:px-6 text-xs sm:text-sm transition-colors ${
                  idx % 2 === 0 ? "bg-slate-50/40 dark:bg-slate-900/20" : "bg-white dark:bg-dark-surface"
                } hover:bg-blue-50/30 dark:hover:bg-blue-950/20`}
              >
                <div className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-3 min-w-0">
                  <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 text-sm">
                    {spec.icon}
                  </span>
                  <span className="truncate">{spec.name}</span>
                </div>
                <div className="text-slate-900 dark:text-white font-semibold text-right ml-4 break-words">
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2.5">
            <div className="size-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
              <FiCpu size={22} />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {displayVariant
                ? "Thông số cho phiên bản này đang được cập nhật..."
                : "Vui lòng chọn phiên bản để xem thông số chi tiết"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SpecificationSection);
