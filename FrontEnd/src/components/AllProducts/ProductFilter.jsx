import React, { useState, useEffect } from "react";
import {
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiZap,
  FiLayers,
  FiSmartphone,
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
          // Chỉ hiển thị các thuộc tính quan trọng trên sidebar
          const importantCodes = ["ram", "rom", "os", "refresh_rate"];
          setAttributes(
            attrRes.data.filter((a) => importantCodes.includes(a.code)),
          );
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
    const currentValues = filters[name] ? filters[name].split(",") : [];
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
      case "ram":
        return <FiLayers className="text-indigo-500" />;
      case "rom":
        return <FiSmartphone className="text-blue-500" />;
      case "os":
        return <FiZap className="text-orange-500" />;
      default:
        return <FiFilter className="text-slate-400" />;
    }
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="border-b border-surface-200 pb-4">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full font-bold text-surface-900 mb-2 hover:text-primary transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Danh mục</span>
          {expandedSections.categories ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.categories && (
          <div className="space-y-2 mt-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {categories.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="categoryId"
                  checked={filters.categoryId === cat.id.toString()}
                  onChange={() =>
                    onFilterChange("categoryId", cat.id.toString())
                  }
                  className="w-4 h-4 text-primary border-surface-300 focus:ring-primary/20"
                />
                <span
                  className={`text-sm transition-colors ${filters.categoryId === cat.id.toString() ? "text-primary font-bold" : "text-surface-600 group-hover:text-primary"}`}
                >
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="border-b border-surface-200 pb-4">
        <button
          onClick={() => toggleSection("brands")}
          className="flex items-center justify-between w-full font-bold text-surface-900 mb-2 hover:text-primary transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Thương hiệu</span>
          {expandedSections.brands ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.brands && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() =>
                  onFilterChange(
                    "brandId",
                    filters.brandId === brand.id.toString()
                      ? ""
                      : brand.id.toString(),
                  )
                }
                className={`px-2 py-2 rounded-xl border text-[10px] font-black uppercase tracking-tighter transition-all ${
                  filters.brandId === brand.id.toString()
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                    : "bg-surface-50 border-surface-100 text-surface-600 hover:border-primary/30"
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Attributes (RAM, ROM, OS...) */}
      {attributes.map((attr) => (
        <div key={attr.id} className="border-b border-surface-200 pb-4">
          <button
            onClick={() => toggleSection(attr.code)}
            className="flex items-center justify-between w-full font-bold text-surface-900 mb-2 hover:text-primary transition-colors"
          >
            <span className="flex items-center gap-2 text-xs uppercase tracking-widest">
              {getAttrIcon(attr.code)}
              {attr.name}
            </span>
            {expandedSections[attr.code] ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {expandedSections[attr.code] && (
            <div className="flex flex-wrap gap-2 mt-3">
              {attr.values?.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleMultiSelect(attr.code, v.value)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                    filters[attr.code]?.split(",").includes(v.value)
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "bg-white border-surface-200 text-surface-600 hover:border-indigo-300"
                  }`}
                >
                  {v.value}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Price Range */}
      <div className="border-b border-surface-200 pb-4">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full font-bold text-surface-900 mb-2 hover:text-primary transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Khoảng giá</span>
          {expandedSections.price ? <FiChevronUp /> : <FiChevronDown />}
        </button>
        {expandedSections.price && (
          <div className="space-y-4 mt-3 pr-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-surface-400 mb-1 block">
                  Từ
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => onFilterChange("minPrice", e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-surface-400 mb-1 block">
                  Đến
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => onFilterChange("maxPrice", e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Filters */}
      <button
        onClick={onClearFilters}
        className="w-full py-3 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center justify-center gap-2 border border-rose-100"
      >
        <FiX /> Xóa tất cả bộ lọc
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Filter Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0 bg-white p-8 rounded-[2.5rem] border border-surface-100 shadow-soft h-fit sticky top-24">
        <div className="flex items-center gap-3 mb-8 text-primary border-b border-surface-50 pb-5">
          <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-sm">
            <FiFilter className="text-xl" />
          </div>
          <h3 className="font-black text-lg text-surface-900 tracking-tight uppercase">
            Bộ lọc
          </h3>
        </div>
        <div className="max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Button & Modal */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-surface-200 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest text-surface-900 shadow-sm active:scale-95 transition-all"
        >
          <FiFilter className="text-lg text-primary" /> Lọc sản phẩm
        </button>

        {isMobileOpen && (
          <div className="fixed inset-0 z-[1000] lg:hidden">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-8 shadow-2xl flex flex-col rounded-l-[3rem]">
              <div className="flex items-center justify-between mb-8 pb-5 border-b border-slate-50">
                <h3 className="font-black text-xl text-slate-900 tracking-tight uppercase">
                  Bộ lọc
                </h3>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl flex items-center justify-center transition-all"
                >
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
