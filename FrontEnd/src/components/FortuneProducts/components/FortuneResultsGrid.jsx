import React from "react";
import { m as Motion } from "framer-motion";
import { Layers, RefreshCw } from "lucide-react";
import ProductCard from "../../ProductCard/ProductCard";
import AppPagination from "../../Pagination/Pagination";
import Button from "../../UI/Button";
import UnifiedSpinner from "../../Loading/UnifiedSpinner";
import { FORTUNE_SORT_OPTIONS } from "./fortuneConstants";

const FortuneResultsGrid = ({
  products,
  luckyColors,
  totalItems,
  fsElement,
  sortBy,
  onSortChange,
  loading,
  page,
  totalPages,
  onPageChange,
  onResetFilters,
}) => {
  return (
    <div className="lg:col-span-9 space-y-6 min-w-0">
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 break-words [overflow-wrap:anywhere]">
            Tìm thấy{" "}
            <strong className="text-slate-900 dark:text-white font-black">
              {totalItems}
            </strong>{" "}
            thiết bị phối màu hợp cá tính{" "}
            {fsElement ? `Nhóm ${fsElement}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Sắp xếp:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sắp xếp kết quả"
            className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {FORTUNE_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-36 gap-4">
            <UnifiedSpinner size="lg" variant="primary" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">
              Đang phân tích gam màu &amp; đối chiếu thiết bị...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 sm:p-24 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto mb-5 flex items-center justify-center">
              <Layers className="size-9" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Không tìm thấy sản phẩm phù hợp bộ lọc
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-sm mx-auto mb-6">
              Hãy thử mở rộng khoảng giá hoặc chọn thương hiệu / danh mục khác để xem thêm nhiều gợi ý phối màu phù hợp.
            </p>
            <Button
              variant="primary"
              onClick={onResetFilters}
              icon={RefreshCw}
              className="!rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Xoá bộ lọc tìm kiếm
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
              {products.map((p, idx) => (
                <Motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                >
                  <ProductCard
                    product={p}
                    highlightColor={
                      p.isLuckyColor ||
                      luckyColors.some((c) =>
                        (p.color || "").toLowerCase().includes(c.toLowerCase()),
                      )
                    }
                  />
                </Motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center pt-8 border-t border-slate-200/80 dark:border-slate-800">
                <AppPagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                  loading={loading}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FortuneResultsGrid;
