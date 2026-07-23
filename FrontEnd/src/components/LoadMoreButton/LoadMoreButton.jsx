import React from "react";
import UnifiedSpinner from "../Loading/UnifiedSpinner";

const LoadMoreButton = ({
  currentPage = 1,
  totalPages = 1,
  loading = false,
  onLoadMore,
  text = "Xem thêm sản phẩm",
}) => {
  if (currentPage >= totalPages) return null;

  return (
    <div className="flex justify-center items-center mt-12 mb-8">
      <button
        onClick={onLoadMore}
        disabled={loading}
        className="group relative inline-flex items-center gap-3 min-h-[44px] px-8 py-3 bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-2xl text-xs sm:text-sm font-black text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary dark:hover:text-primary transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        {loading ? (
          <>
            <UnifiedSpinner size="sm" variant="primary" />
            <span className="uppercase tracking-widest">Đang tải sản phẩm...</span>
          </>
        ) : (
          <>
            <span className="uppercase tracking-widest">{text}</span>
            <div className="absolute inset-x-0 -bottom-1 h-1 bg-primary/10 rounded-full scale-x-0 group-hover:scale-x-75 transition-transform duration-500"></div>
          </>
        )}
      </button>
    </div>
  );
};

export default React.memo(LoadMoreButton);
