import React from "react";
import {
  Filter,
  RotateCcw,
  Activity,
  Tag,
  Layers,
  Check,
  DollarSign,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import PriceFilterPanel from "../PriceFilterPanel";

const SidebarFilterPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  activeCount,
  isFlashSaleActive,
  expandedSections,
  toggleSection,
  categories,
  brands,
  attributes,
  handleMultiSelect,
  isSelected,
  getAttrIcon,
}) => {
  return (
    <div className="w-full bg-white/95 dark:bg-[#0c101a]/95 backdrop-blur-2xl p-5 rounded-3xl border border-slate-200/90 dark:border-cyan-900/30 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] h-fit sticky top-24 space-y-4">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="size-9 bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 font-black rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Filter className="size-4 text-white" />
          </div>
          <div>
            <h3 className="font-black text-xs text-slate-900 dark:text-white tracking-wider uppercase font-mono">
              BỘ LỌC CÔNG NGHỆ CAO
            </h3>
            {activeCount > 0 ? (
              <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                Đã chọn {activeCount} tiêu chí
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">
                Tùy chỉnh thông số máy
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400 font-mono font-bold">
            AI READY
          </span>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase flex items-center gap-1 cursor-pointer"
              title="Xóa tất cả bộ lọc"
              aria-label="Xóa tất cả bộ lọc"
            >
              <RotateCcw className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Activity className="size-3.5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                AI Smart Match
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Tự tối ưu theo ngân sách
              </div>
            </div>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-mono font-bold">
            AUTO
          </span>
        </div>

        <button
          type="button"
          aria-pressed={isFlashSaleActive}
          onClick={() => {
            const next = isFlashSaleActive ? "" : "true";
            onFilterChange("isFlashSale", next);
            onFilterChange("flashSale", next);
          }}
          className={`w-full p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            isFlashSaleActive
              ? "bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
              : "bg-slate-50 dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/40"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs font-mono">
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
            <span>SĂN DEAL FLASH SALE ⚡</span>
          </div>
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

        {!filters.category && (
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <button
              type="button"
              onClick={() => toggleSection("categories")}
              className="flex items-center justify-between w-full font-bold text-slate-800 dark:text-slate-200 text-xs mb-2 cursor-pointer hover:text-cyan-500 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Tag className="text-cyan-500 size-3.5" /> Danh mục sản phẩm
              </span>
              {expandedSections.categories ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
            {expandedSections.categories && (
              <div className="space-y-1 mt-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {categories.map((cat) => {
                  const checked = isSelected("categoryId", cat.id, cat.slug);
                  return (
                    <label
                      key={cat.id}
                      className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-cyan-950/20 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            handleMultiSelect("categoryId", cat.id.toString())
                          }
                          className="size-3.5 text-cyan-600 rounded border-slate-300 dark:border-slate-700 cursor-pointer focus:ring-0"
                        />
                        <span
                          className={`text-xs truncate ${
                            checked
                              ? "text-cyan-600 dark:text-cyan-400 font-bold"
                              : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {cat.name}
                        </span>
                      </div>
                      {cat.productCount > 0 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {cat.productCount}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!filters.brand && (
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <button
              type="button"
              onClick={() => toggleSection("brands")}
              className="flex items-center justify-between w-full font-bold text-slate-800 dark:text-slate-200 text-xs mb-2 cursor-pointer hover:text-indigo-500 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Layers className="text-indigo-500 size-3.5" /> Hãng sản xuất
              </span>
              {expandedSections.brands ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
            {expandedSections.brands && (
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {brands.map((brand) => {
                  const checked = isSelected("brandId", brand.id, brand.slug);
                  return (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() =>
                        handleMultiSelect("brandId", brand.id.toString())
                      }
                      className={`px-2 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-between ${
                        checked
                          ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                          : "bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                      }`}
                    >
                      <span className="truncate">{brand.name}</span>
                      {checked && <Check className="size-3 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <button
            type="button"
            onClick={() => toggleSection("price")}
            className="flex items-center justify-between w-full font-bold text-slate-800 dark:text-slate-200 text-xs mb-2 cursor-pointer hover:text-emerald-500 transition-colors"
          >
            <span className="flex items-center gap-2">
              <DollarSign className="text-emerald-500 size-3.5" /> Phổ giá &amp; Ngân sách
            </span>
            {expandedSections.price ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}
          </button>
          {expandedSections.price && (
            <div className="mt-2">
              <PriceFilterPanel
                filters={filters}
                onFilterChange={onFilterChange}
                variant="sidebar"
              />
            </div>
          )}
        </div>

        {attributes.map((attr) => (
          <div
            key={attr.id}
            className="border-b border-slate-100 dark:border-slate-800/80 pb-3"
          >
            <button
              type="button"
              onClick={() => toggleSection(attr.code)}
              className="flex items-center justify-between w-full font-bold text-slate-800 dark:text-slate-200 text-xs mb-2 cursor-pointer hover:text-cyan-500 transition-colors"
            >
              <span className="flex items-center gap-2">
                {getAttrIcon(attr.code)} {attr.name}
              </span>
              {expandedSections[attr.code] ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>
            {expandedSections[attr.code] && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {attr.values?.map((v) => {
                  const selected = filters[attr.code]
                    ? filters[attr.code].split(",").includes(v.value)
                    : false;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleMultiSelect(attr.code, v.value)}
                      className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                        selected
                          ? "bg-cyan-500 border-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                          : "bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-400"
                      }`}
                    >
                      {v.value}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarFilterPanel;
