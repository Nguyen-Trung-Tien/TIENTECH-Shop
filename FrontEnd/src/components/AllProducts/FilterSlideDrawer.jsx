import React, { useEffect } from "react";
import { FiSliders, FiX, FiZap, FiTag, FiCheck, FiLayers, FiDollarSign } from "react-icons/fi";
import PriceFilterPanel from "./PriceFilterPanel";

const FilterSlideDrawer = ({
  isDrawerOpen,
  setIsDrawerOpen,
  activeCount,
  filters,
  onFilterChange,
  onClearFilters,
  categories,
  brands,
  attributes,
  handleMultiSelect,
  isSelected,
  isFlashSaleActive,
  getAttrIcon,
}) => {
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsDrawerOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Bộ lọc chuyên sâu"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-96 max-w-[92vw] bg-white dark:bg-[#0c101a] shadow-2xl h-full flex flex-col z-10 border-l border-slate-200 dark:border-cyan-900/40 animate-in slide-in-from-right duration-200 overscroll-contain">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-9 bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 rounded-xl flex items-center justify-center font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <FiSliders />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight font-mono">
                BỘ LỌC CHUYÊN SÂU
              </h3>
              {activeCount > 0 && (
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                  {activeCount} tiêu chí đang áp dụng
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClearFilters}
                className="text-xs font-bold text-rose-500 hover:underline cursor-pointer font-mono"
              >
                Đặt lại
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Đóng bộ lọc"
              className="size-8 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors border border-slate-200 dark:border-slate-800"
            >
              <FiX className="text-sm" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-5 overflow-y-auto overscroll-contain flex-1 space-y-5 scrollbar-thin">
          {/* Flash Sale Card */}
          <button
            type="button"
            onClick={() => {
              const next = isFlashSaleActive ? "" : "true";
              onFilterChange("isFlashSale", next);
              onFilterChange("flashSale", next);
            }}
            className={`w-full p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              isFlashSaleActive
                ? "bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <span className="flex items-center gap-2 text-xs font-bold font-mono">
              <FiZap
                className={
                  isFlashSaleActive
                    ? "fill-current text-amber-500 animate-pulse"
                    : "text-slate-400"
                }
              />
              SĂN DEAL FLASH SALE ⚡
            </span>
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                isFlashSaleActive ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <div
                className={`size-4 rounded-full bg-white transition-transform ${
                  isFlashSaleActive ? "translate-x-4 shadow-xs" : ""
                }`}
              />
            </div>
          </button>

          {/* Categories */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <FiTag className="text-cyan-400" /> Danh mục sản phẩm
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((cat) => {
                const checked = isSelected("categoryId", cat.id, cat.slug);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      handleMultiSelect("categoryId", cat.id.toString())
                    }
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between min-w-0 ${
                      checked
                        ? "bg-cyan-500 border-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                        : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {checked && <FiCheck className="text-xs shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brands */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <FiLayers className="text-indigo-400" /> Hãng sản xuất
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {brands.map((brand) => {
                const checked = isSelected("brandId", brand.id, brand.slug);
                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() =>
                      handleMultiSelect("brandId", brand.id.toString())
                    }
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between min-w-0 ${
                      checked
                        ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                        : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="truncate">{brand.name}</span>
                    {checked && <FiCheck className="text-xs shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <FiDollarSign className="text-emerald-400" /> Phổ giá &amp; Ngân sách
            </div>
            <PriceFilterPanel
              filters={filters}
              onFilterChange={onFilterChange}
              variant="drawer"
            />
          </div>

          {/* Technical Specs */}
          {attributes.map((attr) => (
            <div key={attr.id} className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                {getAttrIcon(attr.code)} {attr.name}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {attr.values?.map((v) => {
                  const selected = filters[attr.code]
                    ? filters[attr.code].split(",").includes(v.value)
                    : false;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleMultiSelect(attr.code, v.value)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                        selected
                          ? "bg-cyan-500 border-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                          : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-400"
                      }`}
                    >
                      {v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#080b12]/70 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(false)}
            className="flex-1 py-3 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_0_16px_rgba(6,182,212,0.3)] cursor-pointer font-mono"
          >
            ÁP DỤNG BỘ LỌC
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSlideDrawer;
