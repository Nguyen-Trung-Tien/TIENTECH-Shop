import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

const AppPagination = ({
  page = 1,
  totalPages = 1,
  onPageChange,
  pageNeighbours = 2,
  loading = false,
  className = "flex items-center justify-center gap-2 mt-8",
}) => {
  if (totalPages <= 1) return null;

  const startPage = Math.max(1, page - pageNeighbours);
  const endPage = Math.min(totalPages, page + pageNeighbours);

  const items = [];

  // ⏮ First
  if (startPage > 1) {
    items.push(
      <button
        key="first"
        disabled={loading}
        onClick={() => onPageChange(1)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary transition-all disabled:opacity-50 shadow-sm"
      >
        <FiChevronsLeft />
      </button>
    );
  }

  // ◀ Prev
  if (page > 1) {
    items.push(
      <button
        key="prev"
        disabled={loading}
        onClick={() => onPageChange(page - 1)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary transition-all disabled:opacity-50 shadow-sm"
      >
        <FiChevronLeft />
      </button>
    );
  }

  // …
  if (startPage > 2) {
    items.push(<span key="start-ellipsis" className="px-2 text-slate-400 font-black">...</span>);
  }

  // 🔢 Pages
  for (let i = startPage; i <= endPage; i++) {
    const isActive = i === page;
    items.push(
      <button
        key={i}
        disabled={loading}
        onClick={() => onPageChange(i)}
        className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all shadow-sm ${
          isActive 
            ? "bg-primary text-white shadow-lg shadow-primary/25 border border-primary" 
            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
        }`}
      >
        {i}
      </button>
    );
  }

  // …
  if (endPage < totalPages - 1) {
    items.push(<span key="end-ellipsis" className="px-2 text-slate-400 font-black">...</span>);
  }

  // ▶ Next
  if (page < totalPages) {
    items.push(
      <button
        key="next"
        disabled={loading}
        onClick={() => onPageChange(page + 1)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary transition-all disabled:opacity-50 shadow-sm"
      >
        <FiChevronRight />
      </button>
    );
  }

  // ⏮ Last
  if (endPage < totalPages) {
    items.push(
      <button
        key="last"
        disabled={loading}
        onClick={() => onPageChange(totalPages)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary transition-all disabled:opacity-50 shadow-sm"
      >
        <FiChevronsRight />
      </button>
    );
  }

  return <div className={className}>{items}</div>;
};

export default AppPagination;
