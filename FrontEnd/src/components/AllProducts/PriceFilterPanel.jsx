import React from "react";

const PRICE_PRESETS = [
  { label: "Dưới 5 triệu", min: "", max: "5000000" },
  { label: "5 - 15 triệu", min: "5000000", max: "15000000" },
  { label: "15 - 30 triệu", min: "15000000", max: "30000000" },
  { label: "Trên 30 triệu", min: "30000000", max: "" },
];

const HISTOGRAM_BARS = [
  { height: "20%", activeRange: [0, 5000000] },
  { height: "35%", activeRange: [0, 5000000] },
  { height: "55%", activeRange: [5000000, 15000000] },
  { height: "85%", activeRange: [5000000, 15000000] },
  { height: "100%", activeRange: [15000000, 30000000] },
  { height: "90%", activeRange: [15000000, 30000000] },
  { height: "70%", activeRange: [15000000, 30000000] },
  { height: "50%", activeRange: [30000000, 100000000] },
  { height: "30%", activeRange: [30000000, 100000000] },
  { height: "15%", activeRange: [30000000, 100000000] },
];

const PriceFilterPanel = ({
  filters,
  onFilterChange,
  variant = "sidebar", // "popover" | "sidebar" | "drawer"
  customMin,
  setCustomMin,
  customMax,
  setCustomMax,
  onApplyCustomPrice,
  onClosePopover,
}) => {
  const isPriceActive = Boolean(filters.minPrice || filters.maxPrice);

  return (
    <div className="space-y-3">
      {/* Histogram Wave Visualization */}
      <div
        className={`${variant === "popover" ? "h-10 p-1.5" : "h-8 p-1"} flex items-end gap-1 px-1.5 bg-slate-100 dark:bg-[#080b12] rounded-xl border border-slate-200 dark:border-slate-800`}
      >
        {HISTOGRAM_BARS.map((bar, i) => {
          const inRange =
            isPriceActive &&
            (!filters.minPrice || bar.activeRange[1] >= Number(filters.minPrice)) &&
            (!filters.maxPrice || bar.activeRange[0] <= Number(filters.maxPrice));
          return (
            <div
              key={i}
              style={{ height: bar.height }}
              className={`w-full rounded-xs transition-all duration-300 ${
                inRange
                  ? "bg-gradient-to-t from-emerald-500 to-cyan-400 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                  : "bg-slate-300 dark:bg-slate-800/80"
              }`}
            />
          );
        })}
      </div>

      {/* Price Presets */}
      <div className="grid grid-cols-2 gap-1.5">
        {PRICE_PRESETS.map((preset, idx) => {
          const isPresetActive =
            filters.minPrice === preset.min && filters.maxPrice === preset.max;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (isPresetActive) {
                  onFilterChange("minPrice", "");
                  onFilterChange("maxPrice", "");
                } else {
                  onFilterChange("minPrice", preset.min);
                  onFilterChange("maxPrice", preset.max);
                }
                if (onClosePopover) onClosePopover();
              }}
              className={`px-2.5 ${variant === "drawer" ? "py-2 text-[11px]" : "py-1.5 text-[11px]"} rounded-xl border font-semibold transition-all cursor-pointer truncate ${
                isPresetActive
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-xs font-bold"
                  : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Custom Price Inputs */}
      {variant === "popover" ? (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Khoảng giá tùy chỉnh (₫)
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              aria-label="Giá tối thiểu"
              value={customMin}
              onChange={(e) => setCustomMin(e.target.value)}
              placeholder="Từ (₫)"
              className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
            />
            <span className="text-slate-400 text-xs font-mono">-</span>
            <input
              type="number"
              aria-label="Giá tối đa"
              value={customMax}
              onChange={(e) => setCustomMax(e.target.value)}
              placeholder="Đến (₫)"
              className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <div className="flex justify-between items-center pt-1">
            {isPriceActive && (
              <button
                type="button"
                onClick={() => {
                  onFilterChange("minPrice", "");
                  onFilterChange("maxPrice", "");
                  if (onClosePopover) onClosePopover();
                }}
                className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
              >
                Xóa giá
              </button>
            )}
            <button
              type="button"
              onClick={onApplyCustomPrice}
              className="ml-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              Áp dụng
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 font-mono">
          <input
            type="number"
            aria-label="Giá tối thiểu"
            value={filters.minPrice || ""}
            onChange={(e) => onFilterChange("minPrice", e.target.value)}
            placeholder="Từ (₫)"
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
          />
          <input
            type="number"
            aria-label="Giá tối đa"
            value={filters.maxPrice || ""}
            onChange={(e) => onFilterChange("maxPrice", e.target.value)}
            placeholder="Đến (₫)"
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
          />
        </div>
      )}
    </div>
  );
};

export default PriceFilterPanel;
