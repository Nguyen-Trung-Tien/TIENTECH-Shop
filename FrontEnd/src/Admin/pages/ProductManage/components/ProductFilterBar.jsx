import React from "react";
import { FiSearch, FiTrash2, FiRefreshCw, FiZap, FiTag, FiBox } from "react-icons/fi";
import MultiSelectDropdown from "./MultiSelectDropdown";

const ProductFilterBar = ({
  searchTerm,
  setSearchTerm,
  filterCategories,
  onToggleCategory,
  filterBrands,
  onToggleBrand,
  categories,
  brands,
  attributes,
  attrFilters,
  onToggleAttrFilter,
  flashSaleOnly,
  setFlashSaleOnly,
  clearFilters,
  fetchProducts,
  loadingTable,
  getAttrIcon,
}) => {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-3xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-dark-border overflow-hidden">
      <div className="p-6 bg-slate-50/50 dark:bg-dark-bg/50 border-b border-slate-100 dark:border-dark-border space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-text-secondary" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo Tên, SKU..."
              className="input-modern h-11 pl-11 bg-white dark:bg-dark-bg border-slate-200 dark:border-dark-border focus:ring-indigo-500 font-medium w-full text-slate-900 dark:text-dark-text-primary text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 h-11 rounded-2xl bg-white dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-slate-500 hover:text-rose-500 font-bold text-xs transition-all hover:border-rose-200 cursor-pointer"
            >
              <FiTrash2 /> Xóa bộ lọc
            </button>
            <button
              type="button"
              onClick={() => fetchProducts(1)}
              className="size-11 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <FiRefreshCw className={loadingTable ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Filter Dropdowns & Flash Sale Toggle */}
        <div className="flex flex-wrap gap-3 pt-1">
          <MultiSelectDropdown
            label="Danh mục"
            options={categories}
            selected={filterCategories}
            onToggle={onToggleCategory}
            icon={<FiTag className="text-indigo-400" />}
          />

          <MultiSelectDropdown
            label="Thương hiệu"
            options={brands}
            selected={filterBrands}
            onToggle={onToggleBrand}
            icon={<FiBox className="text-indigo-400" />}
          />

          {attributes.slice(0, 3).map((attr) => (
            <MultiSelectDropdown
              key={attr.id}
              label={attr.name}
              options={attr.values || []}
              selected={attrFilters[attr.code] || []}
              onToggle={(val) => onToggleAttrFilter(attr.code, val)}
              icon={getAttrIcon(attr.code)}
            />
          ))}

          <label className="flex items-center gap-2 px-4 h-10 bg-white dark:bg-dark-bg rounded-2xl border border-slate-200 dark:border-dark-border cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all group shrink-0">
            <input
              type="checkbox"
              checked={flashSaleOnly}
              onChange={(e) => setFlashSaleOnly(e.target.checked)}
              className="form-checkbox size-4 text-orange-500 rounded border-slate-300 dark:border-dark-border"
            />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-dark-text-secondary group-hover:text-orange-600 flex items-center gap-1.5">
              <FiZap className={flashSaleOnly ? "text-orange-500 fill-orange-500" : "text-slate-400"} />
              Flash Sale
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductFilterBar;
