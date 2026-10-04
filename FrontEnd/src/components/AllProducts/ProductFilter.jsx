import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiZap,
  FiLayers,
  FiSmartphone,
  FiMonitor,
  FiSettings,
  FiCpu,
  FiBattery,
  FiCheck,
  FiRotateCcw,
  FiTag,
  FiDollarSign,
  FiSliders,
  FiLayout,
  FiSidebar,
  FiSearch,
  FiActivity,
} from "react-icons/fi";
import { getAllBrandApi } from "../../api/brandApi";
import { getAllCategoryApi } from "../../api/categoryApi";
import { getAllAttributesApi } from "../../api/attributeApi";

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

const getAttrIcon = (code) => {
  switch (code) {
    case "ram":
      return <FiLayers className="text-cyan-400 shrink-0" />;
    case "rom":
      return <FiSmartphone className="text-indigo-400 shrink-0" />;
    case "os":
      return <FiSettings className="text-orange-400 shrink-0" />;
    case "screen":
      return <FiMonitor className="text-emerald-400 shrink-0" />;
    case "battery":
      return <FiBattery className="text-rose-400 shrink-0" />;
    case "refresh_rate":
      return <FiZap className="text-amber-400 shrink-0" />;
    case "cpu":
      return <FiCpu className="text-purple-400 shrink-0" />;
    default:
      return <FiTag className="text-slate-400 shrink-0" />;
  }
};

const ProductFilter = ({
  filters,
  onFilterChange,
  onClearFilters,
  layout = "topbar",
  onToggleLayout,
  totalProductsCount = 0,
}) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
  const dropdownRef = useRef(null);

  const [customMin, setCustomMin] = useState(filters.minPrice || "");
  const [customMax, setCustomMax] = useState(filters.maxPrice || "");

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    ram: true,
    rom: true,
    os: false,
    refresh_rate: false,
    screen: false,
    battery: false,
  });

  useEffect(() => {
    setCustomMin(filters.minPrice || "");
    setCustomMax(filters.maxPrice || "");
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes, attrRes] = await Promise.all([
          getAllCategoryApi(),
          getAllBrandApi(),
          getAllAttributesApi(),
        ]);

        if (catRes?.data) setCategories(catRes.data);
        if (brandRes?.brands) setBrands(brandRes.brands);
        else if (brandRes?.data) setBrands(brandRes.data);

        if (attrRes?.errCode === 0) {
          setAttributes(attrRes.data);
        }
      } catch (err) {
        console.error("Error fetching filter data:", err);
      }
    };
    fetchData();
  }, []);

  // Click outside to close dropdown in topbar mode
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleMultiSelect = (name, value) => {
    let currentValues = filters[name]
      ? filters[name].split(",").filter(Boolean)
      : [];

    if (currentValues.length === 0) {
      if (name === "brandId" && filters.brand) {
        const currentBrandObj = brands.find((b) => b.slug === filters.brand);
        if (currentBrandObj && currentBrandObj.id.toString() !== value) {
          currentValues.push(currentBrandObj.id.toString());
        }
      }
      if (name === "categoryId" && filters.category) {
        const currentCatObj = categories.find(
          (c) => c.slug === filters.category,
        );
        if (currentCatObj && currentCatObj.id.toString() !== value) {
          currentValues.push(currentCatObj.id.toString());
        }
      }
    }

    const index = currentValues.indexOf(value);
    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(value);
    }
    onFilterChange(name, currentValues.join(","));
  };

  const isSelected = (name, id, value) => {
    const currentValues = filters[name] ? filters[name].split(",") : [];
    if (currentValues.includes(id?.toString() || value)) return true;
    if (
      name === "brandId" &&
      filters.brand === value &&
      currentValues.length === 0
    )
      return true;
    if (
      name === "categoryId" &&
      filters.category === value &&
      currentValues.length === 0
    )
      return true;
    return false;
  };

  // Tính số lượng bộ lọc đang được kích hoạt
  const activeCount = useMemo(() => {
    let count = 0;
    [
      "brandId",
      "categoryId",
      "ram",
      "rom",
      "os",
      "refresh_rate",
      "screen",
      "battery",
      "cpu",
    ].forEach((k) => {
      if (filters[k]) count += filters[k].split(",").filter(Boolean).length;
    });
    if (filters.minPrice || filters.maxPrice) count += 1;
    if (
      filters.isFlashSale === "true" ||
      filters.flashSale === "true" ||
      filters.isFlashSale === true
    )
      count += 1;
    return count;
  }, [filters]);

  const isFlashSaleActive = Boolean(
    filters.isFlashSale === "true" ||
      filters.flashSale === "true" ||
      filters.isFlashSale === true,
  );

  const selectedCategoriesCount = useMemo(() => {
    return filters.categoryId
      ? filters.categoryId.split(",").filter(Boolean).length
      : 0;
  }, [filters.categoryId]);

  const selectedBrandsCount = useMemo(() => {
    return filters.brandId
      ? filters.brandId.split(",").filter(Boolean).length
      : 0;
  }, [filters.brandId]);

  const selectedSpecsCount = useMemo(() => {
    let c = 0;
    ["ram", "rom", "os", "refresh_rate", "screen", "battery", "cpu"].forEach(
      (k) => {
        if (filters[k]) c += filters[k].split(",").filter(Boolean).length;
      },
    );
    return c;
  }, [filters]);

  const isPriceActive = Boolean(filters.minPrice || filters.maxPrice);

  const handleApplyCustomPrice = () => {
    onFilterChange("minPrice", customMin);
    onFilterChange("maxPrice", customMax);
    setActiveDropdown(null);
  };

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    return categories.filter((c) =>
      c?.name?.toLowerCase().includes(categorySearch.toLowerCase().trim()),
    );
  }, [categories, categorySearch]);

  const ramAttribute = attributes.find((a) => a.code === "ram");
  const romAttribute = attributes.find((a) => a.code === "rom");

  // ==========================================
  // TOPBAR MODE: Obsidian Cyberflux Command Bar
  // ==========================================
  if (layout === "topbar") {
    return (
      <div className="mb-6 space-y-3 relative z-30" ref={dropdownRef}>
        {/* Main Command Bar Capsule */}
        <div className="relative z-30 p-2 sm:p-2.5 rounded-2xl bg-white/95 dark:bg-[#0c101a]/95 backdrop-blur-2xl border border-slate-200/90 dark:border-cyan-900/30 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Group: Quick Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Flash Sale Toggle Pill with Live Pulse */}
            <button
              type="button"
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
                FLASH SALE <span className="text-amber-500 text-[11px]">⚡</span>
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
                <FiTag className="text-xs text-cyan-500 dark:text-cyan-400" />
                <span>Danh mục</span>
                {selectedCategoriesCount > 0 && (
                  <span className="size-4.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center font-mono">
                    {selectedCategoriesCount}
                  </span>
                )}
                <FiChevronDown
                  className={`text-xs text-slate-400 transition-transform ${activeDropdown === "category" ? "rotate-180" : ""}`}
                />
              </button>

              {/* Category Popover */}
              {activeDropdown === "category" && (
                <div className="absolute left-0 top-full mt-2 w-76 max-w-[calc(100vw-2rem)] p-3 bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-200 dark:border-cyan-900/40 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="relative mb-2.5">
                    <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Tìm kiếm danh mục..."
                      className="w-full pl-7 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {filteredCategories.map((cat) => {
                      const checked = isSelected(
                        "categoryId",
                        cat.id,
                        cat.slug,
                      );
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
                                handleMultiSelect(
                                  "categoryId",
                                  cat.id.toString(),
                                )
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
                  setActiveDropdown((prev) =>
                    prev === "brand" ? null : "brand",
                  )
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  selectedBrandsCount > 0
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.15)] font-bold"
                    : "bg-slate-50 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/40"
                }`}
              >
                <FiLayers className="text-xs text-indigo-500 dark:text-indigo-400" />
                <span>Thương hiệu</span>
                {selectedBrandsCount > 0 && (
                  <span className="size-4.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                    {selectedBrandsCount}
                  </span>
                )}
                <FiChevronDown
                  className={`text-xs text-slate-400 transition-transform ${activeDropdown === "brand" ? "rotate-180" : ""}`}
                />
              </button>

              {/* Brand Popover */}
              {activeDropdown === "brand" && (
                <div className="absolute left-0 top-full mt-2 w-76 max-w-[calc(100vw-2rem)] p-3.5 bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-200 dark:border-indigo-900/40 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1.5">
                    <FiLayers className="text-indigo-400" /> Hãng sản xuất
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                    {brands.map((brand) => {
                      const checked = isSelected(
                        "brandId",
                        brand.id,
                        brand.slug,
                      );
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
                          {checked && <FiCheck className="text-xs shrink-0" />}
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

            {/* Price Dropdown Pill with Cyber Histogram Indicator */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() =>
                  setActiveDropdown((prev) =>
                    prev === "price" ? null : "price",
                  )
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isPriceActive
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-bold"
                    : "bg-slate-50 dark:bg-slate-900/70 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/40"
                }`}
              >
                <FiDollarSign className="text-xs text-emerald-500 dark:text-emerald-400" />
                <span>Mức giá</span>
                {isPriceActive && (
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <FiChevronDown
                  className={`text-xs text-slate-400 transition-transform ${activeDropdown === "price" ? "rotate-180" : ""}`}
                />
              </button>

              {/* Price Popover with Histogram Soundwave Visualization */}
              {activeDropdown === "price" && (
                <div className="absolute left-0 sm:left-auto sm:right-0 md:left-0 md:right-auto top-full mt-2 w-84 max-w-[calc(100vw-2rem)] p-4 bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-200 dark:border-emerald-900/40 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                      <FiActivity className="text-emerald-500" /> Phổ giá & Tần suất
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      {isPriceActive ? "Đang lọc" : "Toàn bộ dải"}
                    </span>
                  </div>

                  {/* Histogram Wave Visualization */}
                  <div className="h-10 flex items-end gap-1 px-1.5 bg-slate-100 dark:bg-[#080b12] rounded-xl p-1.5 border border-slate-200 dark:border-slate-800">
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
                              : "bg-slate-300 dark:bg-slate-800/80 hover:bg-slate-400"
                          }`}
                        />
                      );
                    })}
                  </div>

                  {/* Price Presets */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRICE_PRESETS.map((preset, idx) => {
                      const isPresetActive =
                        filters.minPrice === preset.min &&
                        filters.maxPrice === preset.max;
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
                            setActiveDropdown(null);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer truncate ${
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
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      Khoảng giá tùy chỉnh (₫)
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={customMin}
                        onChange={(e) => setCustomMin(e.target.value)}
                        placeholder="Từ (₫)"
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                      />
                      <span className="text-slate-400 text-xs font-mono">-</span>
                      <input
                        type="number"
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
                            setActiveDropdown(null);
                          }}
                          className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                        >
                          Xóa giá
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleApplyCustomPrice}
                        className="ml-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Specs Dropdown Pill (RAM & ROM & Hardware) */}
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
                  <FiCpu className="text-xs text-purple-500 dark:text-purple-400" />
                  <span>Thông số</span>
                  {selectedSpecsCount > 0 && (
                    <span className="size-4.5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                      {selectedSpecsCount}
                    </span>
                  )}
                  <FiChevronDown
                    className={`text-xs text-slate-400 transition-transform ${activeDropdown === "specs" ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Specs Popover */}
                {activeDropdown === "specs" && (
                  <div className="absolute left-0 sm:left-auto sm:right-0 md:left-0 md:right-auto top-full mt-2 w-84 max-w-[calc(100vw-2rem)] p-4 bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-200 dark:border-purple-900/40 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3.5">
                    {ramAttribute && (
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono flex items-center gap-1">
                          <FiLayers className="text-cyan-400" /> Dung lượng RAM
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {ramAttribute.values?.map((v) => {
                            const checked = filters.ram
                              ?.split(",")
                              .includes(v.value);
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() =>
                                  handleMultiSelect("ram", v.value)
                                }
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
                          <FiSmartphone className="text-indigo-400" /> Bộ nhớ trong (ROM)
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {romAttribute.values?.map((v) => {
                            const checked = filters.rom
                              ?.split(",")
                              .includes(v.value);
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() =>
                                  handleMultiSelect("rom", v.value)
                                }
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

          {/* Right Group: Drawer Trigger & Action Buttons */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Advanced Filters Drawer Button */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/25 border border-cyan-500/40 transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
              title="Mở tất cả bộ lọc nâng cao"
            >
              <FiSliders className="text-xs text-cyan-500 dark:text-cyan-400" />
              <span className="font-mono tracking-tight uppercase text-[11px]">BỘ LỌC CHUYÊN SÂU</span>
              {activeCount > 0 && (
                <span className="size-4.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center font-mono">
                  {activeCount}
                </span>
              )}
            </button>

            {/* Clear All Reset */}
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
                title="Đặt lại toàn bộ bộ lọc"
              >
                <FiRotateCcw className="text-xs" />
                <span className="hidden sm:inline">Đặt lại</span>
              </button>
            )}
          </div>
        </div>

        {/* Slide-over Filter Drawer */}
        {renderSlideDrawer({
          isDrawerOpen,
          setIsDrawerOpen,
          activeCount,
          filters,
          onFilterChange,
          onClearFilters,
          categories,
          brands,
          attributes,
          expandedSections,
          toggleSection,
          handleMultiSelect,
          isSelected,
          isFlashSaleActive,
          PRICE_PRESETS,
        })}
      </div>
    );
  }

  // ==========================================
  // SIDEBAR MODE: Obsidian Cyberflux Faceted Sidebar
  // ==========================================
  return (
    <>
      <div className="w-full bg-white/95 dark:bg-[#0c101a]/95 backdrop-blur-2xl p-5 rounded-3xl border border-slate-200/90 dark:border-cyan-900/30 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] h-fit sticky top-24 space-y-4">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="size-9 bg-gradient-to-br from-cyan-500 to-indigo-600 text-slate-950 font-black rounded-xl flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <FiFilter className="text-sm text-white" />
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
              >
                <FiRotateCcw className="text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-4">
          {/* AI Smart Match Assistant Card */}
          <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <FiActivity className="text-xs" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">AI Smart Match</div>
                <div className="text-[10px] text-slate-400 font-mono">Tự tối ưu theo ngân sách</div>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-mono font-bold">
              AUTO
            </span>
          </div>

          {/* Flash Sale Banner Switch */}
          <div
            onClick={() => {
              const next = isFlashSaleActive ? "" : "true";
              onFilterChange("isFlashSale", next);
              onFilterChange("flashSale", next);
            }}
            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
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
          </div>

          {/* Categories Accordion */}
          {!filters.category && (
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <button
                type="button"
                onClick={() => toggleSection("categories")}
                className="flex items-center justify-between w-full font-bold text-slate-800 dark:text-slate-200 text-xs mb-2 cursor-pointer hover:text-cyan-500 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FiTag className="text-cyan-500 text-xs" /> Danh mục sản phẩm
                </span>
                {expandedSections.categories ? (
                  <FiChevronUp className="text-xs" />
                ) : (
                  <FiChevronDown className="text-xs" />
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

          {/* Brands Section */}
          {!filters.brand && (
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <button
                type="button"
                onClick={() => toggleSection("brands")}
                className="flex items-center justify-between w-full font-bold text-slate-800 dark:text-slate-200 text-xs mb-2 cursor-pointer hover:text-indigo-500 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FiLayers className="text-indigo-500 text-xs" /> Hãng sản xuất
                </span>
                {expandedSections.brands ? (
                  <FiChevronUp className="text-xs" />
                ) : (
                  <FiChevronDown className="text-xs" />
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
                        {checked && <FiCheck className="text-xs shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Price Range Section with Histogram */}
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <button
              type="button"
              onClick={() => toggleSection("price")}
              className="flex items-center justify-between w-full font-bold text-slate-800 dark:text-slate-200 text-xs mb-2 cursor-pointer hover:text-emerald-500 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FiDollarSign className="text-emerald-500 text-xs" /> Phổ giá & Ngân sách
              </span>
              {expandedSections.price ? (
                <FiChevronUp className="text-xs" />
              ) : (
                <FiChevronDown className="text-xs" />
              )}
            </button>
            {expandedSections.price && (
              <div className="space-y-2.5 mt-2">
                {/* Histogram Wave in Sidebar */}
                <div className="h-8 flex items-end gap-1 px-1 bg-slate-100 dark:bg-[#080b12] rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                  {HISTOGRAM_BARS.map((bar, i) => {
                    const inRange =
                      isPriceActive &&
                      (!filters.minPrice || bar.activeRange[1] >= Number(filters.minPrice)) &&
                      (!filters.maxPrice || bar.activeRange[0] <= Number(filters.maxPrice));
                    return (
                      <div
                        key={i}
                        style={{ height: bar.height }}
                        className={`w-full rounded-xs transition-all ${
                          inRange
                            ? "bg-gradient-to-t from-emerald-500 to-cyan-400 shadow-[0_0_4px_rgba(16,185,129,0.5)]"
                            : "bg-slate-300 dark:bg-slate-800/70"
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {PRICE_PRESETS.map((preset, idx) => {
                    const isPresetActive =
                      filters.minPrice === preset.min &&
                      filters.maxPrice === preset.max;
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
                        }}
                        className={`px-2 py-1.5 rounded-xl border text-[10px] font-semibold transition-all cursor-pointer truncate ${
                          isPresetActive
                            ? "bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs"
                            : "bg-slate-50 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400"
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-1.5 font-mono">
                  <input
                    type="number"
                    value={filters.minPrice || ""}
                    onChange={(e) => onFilterChange("minPrice", e.target.value)}
                    placeholder="Từ (₫)"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice || ""}
                    onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                    placeholder="Đến (₫)"
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Technical Specs Attributes */}
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
                  <FiChevronUp className="text-xs" />
                ) : (
                  <FiChevronDown className="text-xs" />
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

      {/* Slide-over Filter Drawer (Mobile & Responsive) */}
      {renderSlideDrawer({
        isDrawerOpen,
        setIsDrawerOpen,
        activeCount,
        filters,
        onFilterChange,
        onClearFilters,
        categories,
        brands,
        attributes,
        expandedSections,
        toggleSection,
        handleMultiSelect,
        isSelected,
        isFlashSaleActive,
        PRICE_PRESETS,
      })}
    </>
  );
};

// ==========================================
// SHARED SLIDE-OVER DRAWER COMPONENT (Obsidian Cyberflux)
// ==========================================
const renderSlideDrawer = ({
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
  PRICE_PRESETS,
}) => {
  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-96 max-w-[92vw] bg-white dark:bg-[#0c101a] shadow-2xl h-full flex flex-col z-10 border-l border-slate-200 dark:border-cyan-900/40 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
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
              className="size-8 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors border border-slate-200 dark:border-slate-800"
            >
              <FiX className="text-sm" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 scrollbar-thin">
          {/* Flash Sale Card */}
          <div
            onClick={() => {
              const next = isFlashSaleActive ? "" : "true";
              onFilterChange("isFlashSale", next);
              onFilterChange("flashSale", next);
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
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
          </div>

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
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
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
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
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
              <FiDollarSign className="text-emerald-400" /> Phổ giá & Ngân sách
            </div>

            {/* Histogram bars in drawer */}
            <div className="h-8 flex items-end gap-1 px-1 bg-slate-100 dark:bg-[#080b12] rounded-lg p-1 border border-slate-200 dark:border-slate-800">
              {HISTOGRAM_BARS.map((bar, i) => {
                const inRange =
                  (filters.minPrice || filters.maxPrice) &&
                  (!filters.minPrice || bar.activeRange[1] >= Number(filters.minPrice)) &&
                  (!filters.maxPrice || bar.activeRange[0] <= Number(filters.maxPrice));
                return (
                  <div
                    key={i}
                    style={{ height: bar.height }}
                    className={`w-full rounded-xs transition-all ${
                      inRange
                        ? "bg-gradient-to-t from-emerald-500 to-cyan-400 shadow-[0_0_4px_rgba(16,185,129,0.5)]"
                        : "bg-slate-300 dark:bg-slate-800/70"
                    }`}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {PRICE_PRESETS.map((preset, idx) => {
                const isPresetActive =
                  filters.minPrice === preset.min &&
                  filters.maxPrice === preset.max;
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
                    }}
                    className={`px-2.5 py-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer truncate ${
                      isPresetActive
                        ? "bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs"
                        : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
              <input
                type="number"
                value={filters.minPrice || ""}
                onChange={(e) => onFilterChange("minPrice", e.target.value)}
                placeholder="Từ (₫)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
              />
              <input
                type="number"
                value={filters.maxPrice || ""}
                onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                placeholder="Đến (₫)"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
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
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#080b12]/70 flex gap-2">
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

export default ProductFilter;
