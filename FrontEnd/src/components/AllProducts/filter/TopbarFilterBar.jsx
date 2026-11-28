import React from "react";
import {
  Tag,
  ChevronDown,
  Search,
  Layers,
  Check,
  DollarSign,
  Activity,
  Cpu,
  Smartphone,
  SlidersHorizontal,
  RotateCcw,
  Zap,
} from "lucide-react";
import PriceFilterPanel from "../PriceFilterPanel";

const TopbarFilterBar = ({
  dropdownRef,
  filters,
  onFilterChange,
  onClearFilters,
  activeDropdown,
  setActiveDropdown,
  setIsDrawerOpen,
  isFlashSaleActive,
  isPriceActive,
  activeCount,
  selectedCategoriesCount,
  selectedBrandsCount,
  selectedSpecsCount,
  categorySearch,
  setCategorySearch,
  filteredCategories,
  brands,
  ramAttribute,
  romAttribute,
  customMin,
  setCustomMin,
  customMax,
  setCustomMax,
  onApplyCustomPrice,
  handleMultiSelect,
  isSelected,
}) => {
  return (
    <div className="mb-6 space-y-3 relative z-30" ref={dropdownRef}>
      <div className="relative z-30 p-2 sm:p-2.5 rounded-2xl bg-white/95 dark:bg-[#0c101a]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-cyan-900/30 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            aria-pressed={isFlashSaleActive}
            onClick={() => {
              const next = isFlashSaleActive ? "" : "true";
              onFilterChange("isFlashSale", next);
              onFilterChange("flashSale", next);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
              isFlashSaleActive
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/60 shadow-[0_0_14px_rgba(245,158,11,0.25)] scale-[1.02]"
                : "bg-slate-50 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800 hover:border-amber-500/40"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full ${
                  isFlashSaleActive ? "bg-amber-400 animate-ping opacity-75" : "bg-transparent"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isFlashSaleActive ? "bg-amber-500" : "bg-amber-500/60"
                }`}
              />
            </span>
            <span className="flex items-center gap-1 font-mono tracking-tight">
              FLASH SALE <Zap className="size-3 text-amber-500 fill-amber-500" aria-hidden="true" />
            </span>
          </button>

          {/* Category Dropdown Pill */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() =>
                setActiveDropdown((prev) =>
                  prev === "category" ? null : "category",
                )
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                selectedCategoriesCount > 0
                  ? "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-bold"
                  : "bg-slate-50 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800 hover:border-cyan-500/40"
              }`}
            >
              <Tag className="size-3.5 text-cyan-500 dark:text-cyan-400" />
              <span>Danh mục</span>
              {selectedCategoriesCount > 0 && (
                <span className="size-4.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center font-mono">
                  {selectedCategoriesCount}
                </span>
              )}
              <ChevronDown
                className={`size-3.5 text-slate-400 transition-transform ${activeDropdown === "category" ? "rotate-180" : ""}`}
              />
            </button>

            {activeDropdown === "category" && (
              <div className="absolute left-0 top-full mt-2 w-76 max-w-[calc(100vw-2rem)] p-3 bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-200 dark:border-cyan-900/40 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="relative mb-2.5">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 size-3.5" />
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Tìm kiếm danh mục..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  {filteredCategories.map((cat) => {
                    const checked = isSelected("categoryId", cat.id, cat.slug);
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-cyan-950/20 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              handleMultiSelect("categoryId", cat.id.toString())
                            }
                            className="size-4 text-cyan-600 rounded border-slate-300 dark:border-slate-700 cursor-pointer focus:ring-0"
                          />
                          <span
                            className={`text-xs truncate ${checked ? "font-bold text-cyan-600 dark:text-cyan-400" : "text-slate-700 dark:text-slate-300"}`}
                          >
                            {cat.name}
                          </span>
                        </div>
                        {cat.productCount > 0 && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            ({cat.productCount})
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-2">
                  {selectedCategoriesCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onFilterChange("categoryId", "")}
                      className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Bỏ chọn ({selectedCategoriesCount})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(null)}
                    className="ml-auto px-3.5 py-1 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-xs"
                  >
                    Xong
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Brand Dropdown Pill */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() =>
                setActiveDropdown((prev) => (prev === "brand" ? null : "brand"))
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                selectedBrandsCount > 0
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.15)] font-bold"
                  : "bg-slate-50 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/40"
              }`}
            >
              <Layers className="size-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Thương hiệu</span>
              {selectedBrandsCount > 0 && (
                <span className="size-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                  {selectedBrandsCount}
                </span>
              )}
              <ChevronDown
                className={`size-3.5 text-slate-400 transition-transform ${activeDropdown === "brand" ? "rotate-180" : ""}`}
              />
            </button>

            {activeDropdown === "brand" && (
              <div className="absolute left-0 top-full mt-2 w-76 max-w-[calc(100vw-2rem)] p-3.5 bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-200 dark:border-indigo-900/40 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                  <Layers className="size-3.5 text-indigo-400" /> Hãng sản xuất
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {brands.map((brand) => {
                    const checked = isSelected("brandId", brand.id, brand.slug);
                    return (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() =>
                          handleMultiSelect("brandId", brand.id.toString())
                        }
                        className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                          checked
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs font-bold"
                            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500/50"
                        }`}
                      >
                        <span className="truncate">{brand.name}</span>
                        {checked && <Check className="size-3 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-2">
                  {selectedBrandsCount > 0 && (
                    <button
                      type="button"
                      onClick={() => onFilterChange("brandId", "")}
                      className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                    >
                      Bỏ chọn ({selectedBrandsCount})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(null)}
                    className="ml-auto px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    Xong
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Price Dropdown Pill */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() =>
                setActiveDropdown((prev) => (prev === "price" ? null : "price"))
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isPriceActive
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-bold"
                  : "bg-slate-50 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/40"
              }`}
            >
              <DollarSign className="size-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Mức giá</span>
              {isPriceActive && (
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <ChevronDown
                className={`size-3.5 text-slate-400 transition-transform ${activeDropdown === "price" ? "rotate-180" : ""}`}
              />
            </button>

            {activeDropdown === "price" && (
              <div className="absolute left-0 sm:left-auto sm:right-0 md:left-0 md:right-auto top-full mt-2 w-84 max-w-[calc(100vw-2rem)] p-4 bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-200 dark:border-emerald-900/40 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                    <Activity className="size-3.5 text-emerald-500" /> Phổ giá &amp; Tần suất
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    {isPriceActive ? "Đang lọc" : "Toàn bộ dải"}
                  </span>
                </div>

                <PriceFilterPanel
                  filters={filters}
                  onFilterChange={onFilterChange}
                  variant="popover"
                  customMin={customMin}
                  setCustomMin={setCustomMin}
                  customMax={customMax}
                  setCustomMax={setCustomMax}
                  onApplyCustomPrice={onApplyCustomPrice}
                  onClosePopover={() => setActiveDropdown(null)}
                />
              </div>
            )}
          </div>

          {/* Specs Dropdown Pill */}
          {(ramAttribute || romAttribute) && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown((prev) =>
                    prev === "specs" ? null : "specs",
                  )
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  selectedSpecsCount > 0
                    ? "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.15)] font-bold"
                    : "bg-slate-50 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800 hover:border-purple-500/40"
                }`}
              >
                <Cpu className="size-3.5 text-purple-500 dark:text-purple-400" />
                <span>Thông số</span>
                {selectedSpecsCount > 0 && (
                  <span className="size-4.5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    {selectedSpecsCount}
                  </span>
                )}
                <ChevronDown
                  className={`size-3.5 text-slate-400 transition-transform ${activeDropdown === "specs" ? "rotate-180" : ""}`}
                />
              </button>

              {activeDropdown === "specs" && (
                <div className="absolute left-0 sm:left-auto sm:right-0 md:left-0 md:right-auto top-full mt-2 w-84 max-w-[calc(100vw-2rem)] p-4 bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-200 dark:border-purple-900/40 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3.5">
                  {ramAttribute && (
                    <div>
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1">
                        <Layers className="size-3.5 text-cyan-400" /> Dung lượng RAM
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ramAttribute.values?.map((v) => {
                          const checked = filters.ram?.split(",").includes(v.value);
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => handleMultiSelect("ram", v.value)}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer ${
                                checked
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
                  )}

                  {romAttribute && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1">
                        <Smartphone className="size-3.5 text-indigo-400" /> Bộ nhớ trong (ROM)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {romAttribute.values?.map((v) => {
                          const checked = filters.rom?.split(",").includes(v.value);
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => handleMultiSelect("rom", v.value)}
                              className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-semibold transition-all cursor-pointer ${
                                checked
                                  ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                                  : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                              }`}
                            >
                              {v.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDropdown(null);
                        setIsDrawerOpen(true);
                      }}
                      className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer font-mono"
                    >
                      Mở bộ lọc chi tiết &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(null)}
                      className="px-3.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                    >
                      Xong
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Group */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/40 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            title="Mở tất cả bộ lọc nâng cao"
          >
            <SlidersHorizontal className="size-3.5 text-cyan-500 dark:text-cyan-400" />
            <span className="font-mono tracking-tight uppercase text-[11px]">
              BỘ LỌC CHUYÊN SÂU
            </span>
            {activeCount > 0 && (
              <span className="size-4.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center font-mono">
                {activeCount}
              </span>
            )}
          </button>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
              title="Đặt lại toàn bộ bộ lọc"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Đặt lại</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopbarFilterBar;
