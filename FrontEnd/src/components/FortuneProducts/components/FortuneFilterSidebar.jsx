import React from "react";
import { Filter, RefreshCw, SlidersHorizontal } from "lucide-react";

const FortuneFilterSidebar = ({
  brands,
  categories,
  brandId,
  categoryId,
  minPrice,
  maxPrice,
  sortBy,
  onBrandChange,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onResetFilters,
}) => {
  const hasFilters = Boolean(
    brandId || categoryId || minPrice || maxPrice || sortBy !== "popular",
  );

  return (
    <aside className="lg:col-span-3 space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Filter className="text-blue-600 dark:text-blue-400 size-4.5" />
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Bộ Lọc Sản Phẩm
            </h3>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="size-3" /> Xoá lọc
            </button>
          )}
        </div>

        <div className="space-y-5 pt-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
              Thương Hiệu
            </label>
            <select
              value={brandId}
              onChange={(e) => onBrandChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Tất cả thương hiệu</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
              Danh Mục
            </label>
            <select
              value={categoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">
              Mức Giá (VNĐ)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Đến"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1.5">
              <SlidersHorizontal className="size-3.5" /> AI Tech Color &amp; Setup Advisor
            </div>
            <p className="leading-relaxed">
              Bạn có thể bấm vào bong bóng chat góc phải để trò chuyện trực tiếp với trợ lý AI và nhận gợi ý phối màu setup thông minh nhất.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FortuneFilterSidebar;
