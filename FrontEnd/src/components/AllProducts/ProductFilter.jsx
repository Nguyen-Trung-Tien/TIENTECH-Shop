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
  FiBattery,
  FiSettings,
  FiCpu,
} from "react-icons/fi";
import { getAllBrandApi } from "../../api/brandApi";
import { getAllCategoryApi } from "../../api/categoryApi";
import { getAllAttributesApi } from "../../api/attributeApi";

const ProductFilter = ({ filters, onFilterChange, onClearFilters }) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    ram: false,
    rom: false,
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
          // Hỗ trợ tất cả các loại thuộc tính kỹ thuật
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
        const currentBrandObj = brands.find(b => b.slug === filters.brand);
        if (currentBrandObj && currentBrandObj.id.toString() !== value) {
          currentValues.push(currentBrandObj.id.toString());
        }
      }
      if (name === "categoryId" && filters.category) {
        const currentCatObj = categories.find(c => c.slug === filters.category);
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
      default: return <FiFilter className="text-slate-400" />;
    }
  };

  const isSelected = (name, id, value) => {
    const currentValues = filters[name] ? filters[name].split(",") : [];
    if (currentValues.includes(id?.toString() || value)) return true;
    if (name === "brandId" && filters.brand === value && currentValues.length === 0) return true;
    if (name === "categoryId" && filters.category === value && currentValues.length === 0) return true;
    return false;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      {!filters.category && (
        <div className="border-b border-slate-100 dark:border-gray-800 pb-4">
          <button
            onClick={() => toggleSection("categories")}
            className="flex items-center justify-between w-full font-black text-slate-900 dark:text-white mb-2 hover:text-blue-600 transition-colors uppercase tracking-widest text-[10px]"
          >
            <span>Danh mục</span>
            {expandedSections.categories ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {expandedSections.categories && (
            <div className="space-y-2 mt-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {categories
                .filter((cat) => {
                  const selectedIds = filters.categoryId ? filters.categoryId.split(",") : [];
                  return selectedIds.length === 0 || selectedIds.includes(cat.id.toString());
                })
                .map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 cursor-pointer group animate-in fade-in duration-300">
                    <input
                      type="checkbox"
                      name="categoryId"
                      checked={isSelected("categoryId", cat.id, cat.slug)}
                      onChange={() => handleMultiSelect("categoryId", cat.id.toString())}
                      className="w-4 h-4 text-blue-600 border-slate-300 dark:border-gray-700 bg-transparent rounded focus:ring-blue-500/20"
                    />
                    <span className={`text-xs font-bold uppercase tracking-wide transition-colors ${isSelected("categoryId", cat.id, cat.slug) ? "text-blue-600 font-black" : "text-slate-500 dark:text-slate-400 group-hover:text-blue-600"}`}>
                      {cat.name}
                    </span>
                  </label>
                ))}
              {filters.categoryId && (
                <button 
                  onClick={() => onFilterChange("categoryId", "")}
                  className="text-[9px] font-black text-blue-500 uppercase mt-2 hover:underline"
                >
                  + Hiện tất cả danh mục
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Brands */}
      {!filters.brand && (
        <div className="border-b border-slate-100 dark:border-gray-800 pb-4">
          <button
            onClick={() => toggleSection("brands")}
            className="flex items-center justify-between w-full font-black text-slate-900 dark:text-white mb-2 hover:text-blue-600 transition-colors uppercase tracking-widest text-[10px]"
          >
            <span>Thương hiệu</span>
            {expandedSections.brands ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {expandedSections.brands && (
            <div className="space-y-2 mt-3">
              <div className="grid grid-cols-2 gap-2">
                {brands
                  .filter((brand) => {
                    const selectedIds = filters.brandId ? filters.brandId.split(",") : [];
                    return selectedIds.length === 0 || selectedIds.includes(brand.id.toString());
                  })
                  .map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => handleMultiSelect("brandId", brand.id.toString())}
                      className={`px-2 py-2 rounded-xl border text-[9px] font-black uppercase tracking-tighter transition-all animate-in fade-in duration-300 ${
                        isSelected("brandId", brand.id, brand.slug)
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                          : "bg-slate-50 dark:bg-gray-800 border-transparent text-slate-600 dark:text-slate-400 hover:border-blue-500/30"
                      }`}
                    >
                      {brand.name}
                    </button>
                  ))}
              </div>
              {filters.brandId && (
                <button 
                  onClick={() => onFilterChange("brandId", "")}
                  className="text-[9px] font-black text-blue-500 uppercase mt-1 hover:underline"
                >
                  + Hiện tất cả thương hiệu
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Dynamic Attributes */}
      {attributes.map((attr) => (
        <div key={attr.id} className="border-b border-slate-100 dark:border-gray-800 pb-4">
          <button
            onClick={() => toggleSection(attr.code)}
            className="flex items-center justify-between w-full font-black text-slate-900 dark:text-white mb-2 hover:text-blue-600 transition-colors uppercase tracking-widest text-[10px]"
          >
            <span className="flex items-center gap-2">
              {getAttrIcon(attr.code)}
              {attr.name}
            </span>
            {expandedSections[attr.code] ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {expandedSections[attr.code] && (
            <div className="flex flex-wrap gap-2 mt-3">
              {attr.values
                ?.filter((v) => {
                  const selected = filters[attr.code] ? filters[attr.code].split(",") : [];
                  return selected.length === 0 || selected.includes(v.value);
                })
                .map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleMultiSelect(attr.code, v.value)}
                  className={`px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all animate-in fade-in duration-300 ${
                    filters[attr.code]?.split(",").includes(v.value)
                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                      : "bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700 text-slate-600 dark:text-slate-400 hover:border-blue-500"
                  }`}
                >
                  {v.value}
                </button>
              ))}
              {filters[attr.code] && (
                <button 
                  onClick={() => onFilterChange(attr.code, "")}
                  className="w-full text-left text-[9px] font-black text-blue-500 uppercase mt-1 hover:underline"
                >
                  + Hiện tất cả {attr.name.toLowerCase()}
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Price Range */}
      <div className="border-b border-slate-100 dark:border-gray-800 pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full font-black text-slate-900 dark:text-white mb-2 hover:text-blue-600 transition-colors uppercase tracking-widest text-[10px]"
        >
          <span>Khoảng giá</span>
          {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.price && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => onFilterChange("minPrice", e.target.value)}
              placeholder="0₫"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-xl text-[10px] font-black outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            />
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => onFilterChange("maxPrice", e.target.value)}
              placeholder="Max₫"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-800 border border-transparent dark:border-gray-700 rounded-xl text-[10px] font-black outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white"
            />
          </div>
        )}
      </div>

      <button
        onClick={onClearFilters}
        className="w-full py-3 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-900/20"
      >
        <FiX /> Xóa bộ lọc
      </button>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-full flex-shrink-0 bg-white dark:bg-black p-8 rounded-[2.5rem] border border-slate-100 dark:border-gray-900 shadow-sm h-fit sticky top-24">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-50 dark:border-gray-900 pb-5">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
            <FiFilter className="text-xl" />
          </div>
          <h3 className="font-black text-lg text-slate-900 dark:text-white tracking-tight uppercase">Bộ lọc</h3>
        </div>
        <FilterContent />
      </div>

      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="w-full h-14 flex items-center justify-center gap-3 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest text-slate-900 dark:text-white shadow-sm transition-all"
        >
          <FiFilter className="text-lg text-blue-600" /> Lọc sản phẩm
        </button>

        {isMobileOpen && (
          <div className="fixed inset-0 z-[1000] lg:hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsMobileOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-black p-8 shadow-2xl flex flex-col rounded-l-[3rem] border-l border-gray-800">
              <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-50 dark:border-gray-900">
                <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight uppercase">Bộ lọc</h3>
                <button onClick={() => setIsMobileOpen(false)} className="w-10 h-10 bg-slate-50 dark:bg-gray-900 text-slate-400 rounded-xl flex items-center justify-center transition-all">
                  <FiX className="text-xl" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                <FilterContent />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductFilter;
