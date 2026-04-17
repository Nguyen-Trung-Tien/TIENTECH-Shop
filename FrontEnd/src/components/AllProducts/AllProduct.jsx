import React from "react";
import { useProductList } from "../../hooks/useProductList";
import ProductCard from "../../components/ProductCard/ProductCard";
import SkeletonCard from "../SkeletonCard/SkeletonCard";
import LoadMoreButton from "../LoadMoreButton/LoadMoreButton";
import ProductFilter from "./ProductFilter";
import { getAllCategoryApi } from "../../api/categoryApi";
import { getAllBrandApi } from "../../api/brandApi";
import { FiAlertCircle, FiSearch, FiLayers, FiZap, FiX } from "react-icons/fi";

const AllProducts = React.memo(() => {
  const limit = 12;
  const {
    products,
    loading,
    loadingMore,
    currentPage,
    totalPages,
    error,
    filters,
    handleUpdateFilters,
    handleLoadMore,
  } = useProductList(limit);

  const [categories, setCategories] = React.useState([]);
  const [brands, setBrands] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const [catRes, brandRes] = await Promise.all([
        getAllCategoryApi(),
        getAllBrandApi(),
      ]);
      if (catRes.errCode === 0) setCategories(catRes.data || []);
      if (brandRes.errCode === 0) setBrands(brandRes.brands || brandRes.data || []);
    };
    fetchData();
  }, []);

  const renderSkeletons = (count = 8) => (
    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={`skeleton-${i}`} />
      ))}
    </div>
  );

  const handleClearFilters = () => {
    handleUpdateFilters({
      search: "",
      categoryId: "",
      brandId: "",
      minPrice: "",
      maxPrice: "",
      sort: "newest",
      flashSale: "",
      ram: "",
      rom: "",
      os: "",
      refresh_rate: "",
      screen: "",
      battery: "",
    });
  };

  const removeFilterItem = (key, value) => {
    const currentValues = filters[key] ? filters[key].split(",") : [];
    const newValues = currentValues.filter(v => v !== value.toString());
    handleUpdateFilters({ [key]: newValues.join(",") });
  };

  // Lấy danh sách các bộ lọc đang active để hiển thị Chip
  const activeFilters = React.useMemo(() => {
    const chips = [];
    const filterKeys = ["brandId", "categoryId", "ram", "rom", "os", "refresh_rate", "screen", "battery"];
    
    filterKeys.forEach(key => {
      if (filters[key]) {
        filters[key].split(",").forEach(val => {
          let label = val;
          if (key === "brandId") label = brands.find(b => b.id.toString() === val)?.name || val;
          if (key === "categoryId") label = categories.find(c => c.id.toString() === val)?.name || val;
          
          chips.push({ key, val, label });
        });
      }
    });

    if (filters.minPrice || filters.maxPrice) {
      if (filters.minPrice !== "" || filters.maxPrice !== "") {
        chips.push({ 
          key: "price", 
          val: "range", 
          label: `${Number(filters.minPrice || 0).toLocaleString()}₫ - ${Number(filters.maxPrice || 100000000).toLocaleString()}₫` 
        });
      }
    }

    return chips;
  }, [filters, brands, categories]);

  return (
    <section className="py-4 md:py-6 bg-white dark:bg-black transition-colors duration-300">
      <div className="container-custom">
        {/* Modern Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 md:mb-8 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500 uppercase">
              <div className="w-6 h-[2px] bg-blue-600 rounded-full shadow-sm"></div>
              <span className="text-[10px] font-black tracking-[0.2em]">
                Hệ thống sản phẩm
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {filters.search
                ? `Kết quả cho: "${filters.search}"`
                : filters.flashSaleOnly
                  ? "Săn Deal Hot"
                  : "Khám phá Công nghệ"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Flash Sale Toggle */}
            <button
              onClick={() =>
                handleUpdateFilters({
                  flashSale: filters.flashSaleOnly ? "" : "true",
                })
              }
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                filters.flashSaleOnly
                  ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "bg-white dark:bg-gray-900 border-slate-200 dark:border-gray-800 text-slate-600 dark:text-gray-400 hover:border-orange-500"
              }`}
            >
              <FiZap className={filters.flashSaleOnly ? "fill-current text-white" : "text-orange-500"} />{" "}
              Flash Sale
            </button>

            {/* Sort Dropdown */}
            <div className="relative group">
              <select
                value={filters.sort}
                onChange={(e) => handleUpdateFilters({ sort: e.target.value })}
                className="appearance-none bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl px-5 py-2.5 pr-10 shadow-sm outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <FiLayers size={10} />
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 animate-in fade-in slide-in-from-top-1 duration-500">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2 border-r border-slate-100 dark:border-gray-800 pr-3 h-4 flex items-center">Đang lọc</span>
            {activeFilters.map((chip, idx) => (
              <button
                key={`${chip.key}-${chip.val}-${idx}`}
                onClick={() => chip.key === "price" ? handleUpdateFilters({ minPrice: "", maxPrice: "" }) : removeFilterItem(chip.key, chip.val)}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500 transition-all group"
              >
                {chip.label}
                <FiX className="text-blue-300 group-hover:text-rose-400" />
              </button>
            ))}
            <button
              onClick={handleClearFilters}
              className="text-[10px] font-black text-rose-500 uppercase ml-2 hover:underline tracking-widest"
            >
              Xóa tất cả
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
          {/* Dynamic Sidebar Filter */}
          <div className="lg:w-64 flex-shrink-0">
            <ProductFilter
                filters={filters}
                onFilterChange={(name, val) => handleUpdateFilters({ [name]: val })}
                onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main Feed */}
          <div className="flex-1 min-w-0">
            {/* Error State */}
            {error && (
              <div className="p-10 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20 text-center shadow-sm">
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <FiAlertCircle size={28} />
                </div>
                <p className="text-slate-900 dark:text-white font-black text-base mb-2">Đã có lỗi xảy ra</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && !products.length && !error && renderSkeletons(8)}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="p-16 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-slate-100 border-dashed dark:border-gray-800 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 dark:bg-gray-800 text-slate-300 dark:text-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <FiSearch size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Không tìm thấy sản phẩm</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs mx-auto opacity-70">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-8 px-8 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {/* Product Grid */}
            {!loading && !error && products.length > 0 && (
              <div className="space-y-12">
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-x-5 gap-y-8 md:gap-x-6 md:gap-y-10">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {loadingMore && renderSkeletons(4)}

                {currentPage < totalPages && (
                   <div className="flex justify-center pt-8 border-t border-slate-50 dark:border-gray-900/50">
                    <LoadMoreButton
                        currentPage={currentPage}
                        totalPages={totalPages}
                        loading={loadingMore}
                        onLoadMore={handleLoadMore}
                    />
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

export default AllProducts;
