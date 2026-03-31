import { useEffect, useState } from "react";
import { getAllBrandApi } from "../../api/brandApi";
import { getAllCategoryApi } from "../../api/categoryApi";
import { getAllAttributesApi } from "../../api/attributeApi";
import { FiFilter, FiX, FiCheck, FiChevronDown, FiRotateCcw, FiLayers, FiCpu, FiSmartphone, FiMonitor, FiZap } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

function ProductFilter({ onFilterChange, isSidebar = false, onClose, initialFilters }) {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);

  const [filters, setFilters] = useState({
    brand: initialFilters?.brand || "",
    category: initialFilters?.category || "",
    price: initialFilters?.price || [0, 100000000],
    sort: initialFilters?.sort || "",
    ram: initialFilters?.ram || "",
    rom: initialFilters?.rom || "",
    os: initialFilters?.os || "",
    refresh_rate: initialFilters?.refresh_rate || ""
  });

  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters,
        brand: initialFilters.brand || "",
        category: initialFilters.category || "",
        price: initialFilters.price || [0, 100000000],
      }));
    }
  }, [initialFilters]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [brandRes, catRes, attrRes] = await Promise.all([
          getAllBrandApi(),
          getAllCategoryApi(),
          getAllAttributesApi()
        ]);
        if (brandRes.errCode === 0) setBrands(brandRes.brands || brandRes.data || []);
        if (catRes.errCode === 0) setCategories(catRes.data || []);
        if (attrRes.errCode === 0) {
          // Chỉ lấy các thuộc tính quan trọng để lọc
          const importantCodes = ["ram", "rom", "os", "refresh_rate", "screen"];
          setAttributes(attrRes.data.filter(a => importantCodes.includes(a.code)));
        }
      } catch (err) {
        console.error("Lỗi load filters:", err);
      }
    };
    fetchData();
  }, []);

  const handleBrandClick = (id) => {
    const newBrand = filters.brand === id ? "" : id;
    const newFilters = { ...filters, brand: newBrand };
    setFilters(newFilters);
    if (isSidebar) onFilterChange(newFilters);
  };

  const handleAttrClick = (code, value) => {
    const newVal = filters[code] === value ? "" : value;
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
      brand: "", category: "", price: [0, 100000000], sort: "",
      ram: "", rom: "", os: "", refresh_rate: ""
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const getAttrIcon = (code) => {
    switch (code) {
      case 'ram': return <FiLayers />;
      case 'rom': return <FiSmartphone />;
      case 'os': return <FiZap />;
      case 'screen': return <FiMonitor />;
      default: return <FiFilter />;
    }
  };

  const FilterContent = () => (
    <div className="space-y-10">
      {/* Brands Section */}
      <div className="space-y-5">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-between">
          Thương hiệu
          {filters.brand && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {brands.slice(0, 6).map((b) => (
            <button
              key={b.id}
              onClick={() => handleBrandClick(b.id)}
              className={`group relative p-3 rounded-2xl border-2 transition-all flex items-center justify-center h-14 bg-white overflow-hidden ${
                filters.brand === b.id 
                  ? "border-primary shadow-lg shadow-primary/5 z-10" 
                  : "border-slate-50 hover:border-slate-200"
              }`}
            >
              {b.image ? (
                <img src={b.image} alt={b.name} className="max-w-[80%] max-h-[80%] object-contain mix-blend-multiply transition-transform group-hover:scale-110" />
              ) : (
                <span className="text-[10px] font-bold text-slate-400">{b.name}</span>
              )}
              {filters.brand === b.id && (
                <div className="absolute top-0 right-0 p-1">
                  <FiCheck className="text-primary" size={12} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Attributes Section */}
      {attributes.map((attr) => (
        <div key={attr.id} className="space-y-5">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            {getAttrIcon(attr.code)}
            {attr.name}
          </h4>
          <div className="flex flex-wrap gap-2">
            {attr.values?.map((v) => (
              <button
                key={v.id}
                onClick={() => handleAttrClick(attr.code, v.value)}
                className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border-2 ${
                  filters[attr.code] === v.value
                    ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                    : "bg-slate-50 border-slate-50 text-slate-600 hover:bg-white hover:border-slate-200"
                }`}
              >
                {v.value}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Price Range Section */}
      <div className="space-y-5">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Khoảng giá (VND)</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 ml-1">TỪ</label>
              <input 
                type="number" 
                placeholder="0"
                className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                value={filters.price[0]}
                onChange={(e) => setFilters({...filters, price: [Number(e.target.value), filters.price[1]]})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 ml-1">ĐẾN</label>
              <input 
                type="number" 
                placeholder="100Tr+"
                className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                value={filters.price[1]}
                onChange={(e) => setFilters({...filters, price: [filters.price[0], Number(e.target.value)]})}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sorting Section */}
      <div className="space-y-5">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sắp xếp theo</h4>
        <div className="space-y-2">
          {[
            { id: "newest", label: "Mới nhất" },
            { id: "price_asc", label: "Giá thấp đến cao" },
            { id: "price_desc", label: "Giá cao đến thấp" },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilters({...filters, sort: opt.id === filters.sort ? "" : opt.id})}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                filters.sort === opt.id 
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {opt.label}
              {filters.sort === opt.id && <FiCheck />}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-6 flex flex-col gap-3">
         <button 
          onClick={applyFilters}
          className="w-full h-12 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
         >
           Áp dụng bộ lọc
         </button>
         <button 
          onClick={resetFilters}
          className="w-full h-12 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all"
         >
           <FiRotateCcw /> Xóa tất cả
         </button>
      </div>
    </div>
  );

  if (isSidebar) {
    return (
      <div className="w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-soft p-8">
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-50">
           <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm"><FiFilter /></div>
           <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Bộ lọc</h3>
        </div>
        <FilterContent />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex justify-end lg:hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col rounded-l-[3rem]"
        >
          <div className="px-8 py-8 flex items-center justify-between">
             <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Bộ lọc</h3>
             <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                <FiX size={24} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-10 custom-scrollbar">
             <FilterContent />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ProductFilter;
