import React from "react";

const Pagination = ({
  page = 1,
  totalPages = 1,
  onPageChange,
  pageNeighbours = 1,
  className = "",
  loading = false,
}) => {
  if (totalPages <= 1) return null;

  const startPage = Math.max(1, page - pageNeighbours);
  const endPage = Math.min(totalPages, page + pageNeighbours);
  const pages = [];

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const buttonBase =
    "w-10 h-10 inline-flex items-center justify-center rounded-lg border text-sm font-semibold transition duration-200 ease-out";
  const active = "bg-brand-500 border-brand-500 text-white shadow-lg";
  const inactive =
    "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100";

  return (
    <div className={`flex items-center flex-wrap gap-2 mt-8 ${className}`}>
      <button
        type="button"
        disabled={loading || page === 1}
        onClick={() => onPageChange(1)}
        className={`${buttonBase} rounded-lg ${page === 1 ? "opacity-50 cursor-not-allowed" : "bg-white hover:bg-neutral-100"}`}
      >
        First
      </button>
      <button
        type="button"
        disabled={loading || page === 1}
        onClick={() => onPageChange(page - 1)}
        className={`${buttonBase} ${page === 1 ? "opacity-50 cursor-not-allowed" : "bg-white hover:bg-neutral-100"}`}
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          disabled={loading}
          onClick={() => onPageChange(p)}
          className={`${buttonBase} ${p === page ? active : inactive}`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        disabled={loading || page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className={`${buttonBase} ${page === totalPages ? "opacity-50 cursor-not-allowed" : "bg-white hover:bg-neutral-100"}`}
      >
        Next
      </button>
      <button
        type="button"
        disabled={loading || page === totalPages}
        onClick={() => onPageChange(totalPages)}
        className={`${buttonBase} ${page === totalPages ? "opacity-50 cursor-not-allowed" : "bg-white hover:bg-neutral-100"}`}
      >
        Last
      </button>
    </div>
  );
};

export default Pagination;
