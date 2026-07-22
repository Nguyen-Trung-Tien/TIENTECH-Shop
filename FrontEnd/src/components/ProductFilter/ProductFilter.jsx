import React, { useEffect, useState } from "react";
import { getAllBrandApi } from "../../api/brandApi";
import { getAllCategoryApi } from "../../api/categoryApi";
import { getAllAttributesApi } from "../../api/attributeApi";
import {
  FiFilter,
  FiX,
  FiCheck,
  FiRotateCcw,
  FiLayers,
  FiSmartphone,
  FiMonitor,
  FiZap,
  FiCpu,
  FiBattery,
  FiTag,
  FiDollarSign,
} from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";

const PRICE_PRESETS = [
  { label: "< 5 triệu", min: 0, max: 5000000 },
  { label: "5 - 15 triệu", min: 5000000, max: 15000000 },
  { label: "15 - 30 triệu", min: 15000000, max: 30000000 },
  { label: "> 30 triệu", min: 30000000, max: 100000000 },
];

const getAttrIcon = (code) => {
  switch (code) {
    case "ram": return <FiLayers className="text-blue-500" />;
    case "rom": return <FiSmartphone className="text-indigo-500" />;
    case "os": return <FiZap className="text-amber-500" />;
    case "screen": return <FiMonitor className="text-emerald-500" />;
    case "cpu": return <FiCpu className="text-purple-500" />;
    case "battery": return <FiBattery className="text-rose-500" />;
    default: return <FiTag className="text-slate-400" />;
  }
};

const FilterContent = ({
  brands,
  attributes,
  filters,
  handleBrandClick,
  handleAttrClick,
  setFilters,
  applyFilters,
  resetFilters,
}) => {
  const activeCount = React.useMemo(() => {
    let count = 0;
    if (filters.brand?.length) count += filters.brand.length;
    if (filters.category) count += 1;
    if (filters.price?.[0] > 0 || filters.price?.[1] < 100000000) count += 1;
    ["ram", "rom", "os", "refresh_rate", "screen", "cpu"].forEach((k) => {
      if (Array.isArray(filters[k]) && filters[k].length > 0) count += filters[k].length;
    });
    return count;
  }, [filters]);

  return (
    <div className="space-y-7">
      {/* Brands Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Thương hiệu
          </h4>
          {filters.brand?.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full">
              {filters.brand.length} đã chọn
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {brands.map((b) => {
            const isSelected = filters.brand?.includes(b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handleBrandClick(b.id)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500/50"
                }`}
              >
                <span className="truncate">{b.name}</span>
                {isSelected && <FiCheck size={12} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Attributes */}
      {attributes.map((attr) => (
        <div key={attr.id} className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
            {getAttrIcon(attr.code)}
            {attr.name}
          </h4>
          <div className="flex flex-wrap gap-2">
            {attr.values?.map((v) => {
              const isSelected =
                Array.isArray(filters[attr.code]) &&
                filters[attr.code].includes(v.value);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => handleAttrClick(attr.code, v.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500/50"
                  }`}
                >
                  {v.value}
                  {isSelected && <FiCheck size={12} />}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Price Range Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <FiDollarSign className="text-emerald-500" /> Mức giá (VND)
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {PRICE_PRESETS.map((preset, idx) => {
            const isPresetActive =
              filters.price?.[0] === preset.min && filters.price?.[1] === preset.max;
            return (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  setFilters({
                    ...filters,
                    price: isPresetActive ? [0, 100000000] : [preset.min, preset.max],
                  })
                }
                className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all cursor-pointer truncate ${
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

        <div className="grid grid-cols-2 gap-2 pt-1">
          <input
            type="number"
            placeholder="Từ 0"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            value={filters.price?.[0] || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                price: [Number(e.target.value), filters.price?.[1] || 100000000],
              })
            }
          />
          <input
            type="number"
            placeholder="Đến Max"
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            value={filters.price?.[1] === 100000000 ? "" : filters.price?.[1]}
            onChange={(e) =>
              setFilters({
                ...filters,
                price: [filters.price?.[0] || 0, Number(e.target.value)],
              })
            }
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 space-y-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={applyFilters}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer"
        >
          Áp dụng bộ lọc
        </button>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 transition-all cursor-pointer"
          >
            <FiRotateCcw size={13} /> Xóa tất cả bộ lọc ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
};

function ProductFilter({
  onFilterChange,
  isSidebar = false,
  onClose,
  initialFilters,
}) {
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]);

  const [filters, setFilters] = useState({
    brand: Array.isArray(initialFilters?.brand)
      ? initialFilters.brand
      : initialFilters?.brand
        ? [initialFilters.brand]
        : [],
    category: initialFilters?.category || "",
    price: initialFilters?.price || [0, 100000000],
    sort: initialFilters?.sort || "",
    ram: Array.isArray(initialFilters?.ram)
      ? initialFilters.ram
      : initialFilters?.ram
        ? initialFilters.ram.split(",")
        : [],
    rom: Array.isArray(initialFilters?.rom)
      ? initialFilters.rom
      : initialFilters?.rom
        ? initialFilters.rom.split(",")
        : [],
    os: Array.isArray(initialFilters?.os)
      ? initialFilters.os
      : initialFilters?.os
        ? initialFilters.os.split(",")
        : [],
    refresh_rate: Array.isArray(initialFilters?.refresh_rate)
      ? initialFilters.refresh_rate
      : initialFilters?.refresh_rate
        ? initialFilters.refresh_rate.split(",")
        : [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandRes, catRes, attrRes] = await Promise.all([
          getAllBrandApi(),
          getAllCategoryApi(),
          getAllAttributesApi(),
        ]);
        if (brandRes?.errCode === 0) setBrands(brandRes.brands || brandRes.data || []);
        if (attrRes?.errCode === 0) setAttributes(attrRes.data || []);
      } catch (err) {
        console.error("Lỗi load filters:", err);
      }
    };
    fetchData();
  }, []);

  const handleBrandClick = (id) => {
    const isSelected = filters.brand.includes(id);
    const newBrand = isSelected
      ? filters.brand.filter((b) => b !== id)
      : [...filters.brand, id];

    const newFilters = { ...filters, brand: newBrand };
    setFilters(newFilters);
    if (isSidebar) onFilterChange(newFilters);
  };

  const handleAttrClick = (code, value) => {
    const currentValues = Array.isArray(filters[code]) ? filters[code] : [];
    const isSelected = currentValues.includes(value);
    const newVal = isSelected
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    const newFilters = { ...filters, [code]: newVal };
    setFilters(newFilters);
    if (isSidebar) onFilterChange(newFilters);
  };

  const applyFilters = () => {
    onFilterChange(filters);
    if (onClose) onClose();
  };

  const resetFilters = () => {
    const defaultFilters = {
      brand: [],
      category: "",
      price: [0, 100000000],
      sort: "",
      ram: [],
      rom: [],
      os: [],
      refresh_rate: [],
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const commonProps = {
    brands,
    attributes,
    filters,
    handleBrandClick,
    handleAttrClick,
    setFilters,
    applyFilters,
    resetFilters,
  };

  if (isSidebar) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="size-10 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FiFilter className="text-lg" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Bộ lọc sản phẩm
          </h3>
        </div>
        <FilterContent {...commonProps} />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex justify-end lg:hidden">
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        <Motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col rounded-l-[32px] border-l border-slate-200 dark:border-slate-800 p-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Bộ lọc nâng cao
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all cursor-pointer"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            <FilterContent {...commonProps} />
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ProductFilter;
