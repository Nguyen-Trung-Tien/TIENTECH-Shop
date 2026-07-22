import React, { useState, useEffect } from "react";
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

const ProductFilter = ({ filters, onFilterChange, onClearFilters }) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleMultiSelect = (name, value) => {
    let currentValues = filters[name] ? filters[name].split(",") : [];

    if (currentValues.length === 0) {
      if (name === "brandId" && filters.brand) {
        const currentBrandObj = brands.find((b) => b.slug === filters.brand);
        if (currentBrandObj && currentBrandObj.id.toString() !== value) {
          currentValues.push(currentBrandObj.id.toString());
        }
      }
      if (name === "categoryId" && filters.category) {
        const currentCatObj = categories.find((c) => c.slug === filters.category);
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

  const getAttrIcon = (code) => {
    switch (code) {
      case "ram": return <FiLayers className="text-blue-500" />;
      case "rom": return <FiSmartphone className="text-indigo-500" />;
      case "os": return <FiSettings className="text-orange-500" />;
      case "screen": return <FiMonitor className="text-emerald-500" />;
      case "battery": return <FiBattery className="text-rose-500" />;
      case "refresh_rate": return <FiZap className="text-amber-500" />;
      case "cpu": return <FiCpu className="text-purple-500" />;
      default: return <FiTag className="text-slate-400" />;
    }
  };

  const isSelected = (name, id, value) => {
    const currentValues = filters[name] ? filters[name].split(",") : [];
    if (currentValues.includes(id?.toString() || value)) return true;
    if (name === "brandId" && filters.brand === value && currentValues.length === 0) return true;
    if (name === "categoryId" && filters.category === value && currentValues.length === 0) return true;
    return false;
  };

  // Tính số lượng bộ lọc đang được kích hoạt
  const activeCount = React.useMemo(() => {
    let count = 0;
    ["brandId", "categoryId", "ram", "rom", "os", "refresh_rate", "screen", "battery", "cpu"].forEach((k) => {
      if (filters[k]) count += filters[k].split(",").filter(Boolean).length;
    });
    if (filters.minPrice || filters.maxPrice) count += 1;
    return count;
  }, [filters]);

  return (
    <>
      {/* Desktop Filter Panel */}
      <div className="hidden lg:block w-full flex-shrink-0 bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-slate-200/80 dark:border-slate-800 shadow-sm h-fit sticky top-24">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
              <FiFilter className="text-lg" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white tracking-tight uppercase">
                Bộ Lọc Sản Phẩm
              </h3>
              {activeCount > 0 && (
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  Đã chọn {activeCount} tiêu chí
                </span>
              )}
            </div>
          </div>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <FiRotateCcw size={12} /> Xóa
            </button>
          )}
        </div>

        <FilterContent
          filters={filters}
          categories={categories}
          brands={brands}
          attributes={attributes}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          handleMultiSelect={handleMultiSelect}
          isSelected={isSelected}
          getAttrIcon={getAttrIcon}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          activeCount={activeCount}
        />
      </div>

      {/* Mobile Filter Button & Drawer */}
      <div className="lg:hidden mb-6">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="w-full h-13 flex items-center justify-between px-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white shadow-sm transition-all cursor-pointer active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <FiFilter className="text-lg text-blue-600" />
            <span>Bộ lọc nâng cao</span>
          </div>
          {activeCount > 0 && (
            <span className="px-2.5 py-0.5 bg-blue-600 text-white font-black text-[10px] rounded-full">
              {activeCount}
            </span>
          )}
        </button>

        {isMobileOpen && (
          <div className="fixed inset-0 z-[1000] lg:hidden">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-85 max-w-[90vw] bg-white dark:bg-slate-900 p-6 shadow-2xl flex flex-col rounded-l-[32px] border-l border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <FiFilter className="text-blue-600 text-xl" />
                  <h3 className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">
                    Bộ Lọc Sản Phẩm
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="size-9 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 pr-1 space-y-6">
                <FilterContent
                  filters={filters}
                  categories={categories}
                  brands={brands}
                  attributes={attributes}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                  handleMultiSelect={handleMultiSelect}
                  isSelected={isSelected}
                  getAttrIcon={getAttrIcon}
                  onFilterChange={onFilterChange}
                  onClearFilters={onClearFilters}
                  activeCount={activeCount}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg"
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const FilterContent = ({
  filters,
  categories,
  brands,
  attributes,
  expandedSections,
  toggleSection,
  handleMultiSelect,
  isSelected,
  getAttrIcon,
  onFilterChange,
  onClearFilters,
  activeCount,
}) => (
  <div className="space-y-5">
    {/* Categories Section */}
    {!filters.category && (
      <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full font-black text-slate-900 dark:text-white mb-2 hover:text-blue-600 transition-colors uppercase tracking-wider text-[11px] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <FiTag className="text-blue-500" /> Danh mục
          </span>
          {expandedSections.categories ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.categories && (
          <div className="space-y-2 mt-3 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const checked = isSelected("categoryId", cat.id, cat.slug);
              return (
                <label
                  key={cat.id}
                  className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleMultiSelect("categoryId", cat.id.toString())}
                      className="size-4 text-blue-600 border-slate-300 dark:border-slate-700 bg-transparent rounded focus:ring-blue-500/20 cursor-pointer"
                    />
                    <span
                      className={`text-xs truncate transition-colors ${
                        checked
                          ? "text-blue-600 dark:text-blue-400 font-bold"
                          : "text-slate-700 dark:text-slate-300 font-medium group-hover:text-blue-600"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </div>
                  {cat.productCount > 0 && (
                    <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
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
      <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection("brands")}
          className="flex items-center justify-between w-full font-black text-slate-900 dark:text-white mb-2 hover:text-blue-600 transition-colors uppercase tracking-wider text-[11px] cursor-pointer"
        >
          <span>Thương hiệu</span>
          {expandedSections.brands ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.brands && (
          <div className="space-y-2 mt-3">
            <div className="grid grid-cols-2 gap-2">
              {brands.map((brand) => {
                const checked = isSelected("brandId", brand.id, brand.slug);
                return (
                  <button
                    key={brand.id}
                    type="button"
                    onClick={() => handleMultiSelect("brandId", brand.id.toString())}
                    className={`px-3 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between ${
                      checked
                        ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500/40"
                    }`}
                  >
                    <span className="truncate">{brand.name}</span>
                    {checked && <FiCheck size={12} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    )}

    {/* Price Presets & Range Section */}
    <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
      <button
        type="button"
        onClick={() => toggleSection("price")}
        className="flex items-center justify-between w-full font-black text-slate-900 dark:text-white mb-2 hover:text-blue-600 transition-colors uppercase tracking-wider text-[11px] cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <FiDollarSign className="text-emerald-500" /> Mức giá
        </span>
        {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {expandedSections.price && (
        <div className="space-y-3 mt-3">
          {/* Presets */}
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
                  }}
                  className={`px-2.5 py-1.5 rounded-xl border text-[9px] font-bold uppercase transition-all cursor-pointer truncate ${
                    isPresetActive
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500/50"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom Input */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <input
              type="number"
              value={filters.minPrice || ""}
              onChange={(e) => onFilterChange("minPrice", e.target.value)}
              placeholder="Từ (₫)"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            />
            <input
              type="number"
              value={filters.maxPrice || ""}
              onChange={(e) => onFilterChange("maxPrice", e.target.value)}
              placeholder="Đến (₫)"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            />
          </div>
        </div>
      )}
    </div>

    {/* Dynamic Technical Attributes */}
    {attributes.map((attr) => (
      <div key={attr.id} className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <button
          type="button"
          onClick={() => toggleSection(attr.code)}
          className="flex items-center justify-between w-full font-black text-slate-900 dark:text-white mb-2 hover:text-blue-600 transition-colors uppercase tracking-wider text-[11px] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            {getAttrIcon(attr.code)}
            {attr.name}
          </span>
          {expandedSections[attr.code] ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections[attr.code] && (
          <div className="flex flex-wrap gap-2 mt-3">
            {attr.values?.map((v) => {
              const selected = filters[attr.code]
                ? filters[attr.code].split(",").includes(v.value)
                : false;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleMultiSelect(attr.code, v.value)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                    selected
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500/50"
                  }`}
                >
                  {v.value}
                  {selected && <FiCheck size={12} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    ))}

    {/* Reset All Button */}
    {activeCount > 0 && (
      <button
        type="button"
        onClick={onClearFilters}
        className="w-full py-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900/40 cursor-pointer"
      >
        <FiRotateCcw /> Xóa tất cả bộ lọc ({activeCount})
      </button>
    )}
  </div>
);

export default ProductFilter;
