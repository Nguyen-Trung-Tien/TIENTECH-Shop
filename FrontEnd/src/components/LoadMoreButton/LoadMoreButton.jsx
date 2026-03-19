import React from "react";
import { FiRefreshCw } from "react-icons/fi";

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
        className="group relative inline-flex items-center gap-2 px-8 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-700 hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? (
          <>
            <FiRefreshCw className="animate-spin text-lg" />
            <span className="uppercase tracking-widest">Đang tải...</span>
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
