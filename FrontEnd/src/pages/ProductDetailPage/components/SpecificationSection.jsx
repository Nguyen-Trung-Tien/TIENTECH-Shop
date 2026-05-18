import React from "react";
import { FiCpu, FiInfo } from "react-icons/fi";

const SpecificationSection = ({ mergedSpecs, displayVariant }) => {
  return (
    <div className="pt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-dark-text-secondary flex items-center gap-2">
          <span className="w-6 h-[1.5px] bg-blue-500 dark:bg-brand"></span>
          Thông số kỹ thuật
        </h3>
        {displayVariant && (
          <span className="text-[10px] font-bold text-blue-600 dark:text-brand bg-blue-50 dark:bg-brand/10 px-2 py-1 rounded-lg">
            Cấu hình riêng {displayVariant.sku?.split("-")[0]}
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-dark-border overflow-hidden bg-gray-50/30 dark:bg-dark-surface shadow-sm transition-all duration-500">
        {mergedSpecs.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            {mergedSpecs.map((spec, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-3.5 px-5 text-xs transition-colors hover:bg-white dark:hover:bg-dark-bg bg-white/40 dark:bg-transparent"
              >
                <span className="text-gray-400 dark:text-dark-text-secondary font-bold uppercase tracking-wider flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-white dark:bg-dark-bg shadow-sm text-blue-500 dark:text-brand">
                    {spec.icon}
                  </span>
                  {spec.name}
                </span>
                <span className="text-gray-900 dark:text-white font-extrabold">
                  {spec.value}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-white dark:bg-dark-bg rounded-full flex items-center justify-center text-gray-200 dark:text-dark-text-secondary shadow-inner">
              <FiCpu size={32} />
            </div>
            <p className="text-xs text-gray-400 dark:text-dark-text-secondary font-medium italic max-w-[200px] leading-relaxed">
              {displayVariant
                ? "Phiên bản này đang được cập nhật thông số..."
                : "Vui lòng chọn phiên bản để xem cấu hình chi tiết."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SpecificationSection);
