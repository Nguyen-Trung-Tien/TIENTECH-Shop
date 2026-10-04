import React from "react";
import { useProductList } from "../../hooks/useProductList";
import ProductCard from "../../components/ProductCard/ProductCard";
import SkeletonCard from "../SkeletonCard/SkeletonCard";
import LoadMoreButton from "../LoadMoreButton/LoadMoreButton";
import ProductFilter from "./ProductFilter";
import { getAllCategoryApi } from "../../api/categoryApi";
import { getAllBrandApi } from "../../api/brandApi";
import { FiAlertCircle, FiSearch, FiX, FiLayout, FiSidebar, FiRotateCcw, FiSliders } from "react-icons/fi";

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
      isFlashSale: "",
      ram: "",
      rom: "",
      os: "",
      refresh_rate: "",
      screen: "",
      battery: "",
    });
  };

  const removeFilterItem = (key, value) => {
    if (key === "isFlashSale" || key === "flashSale") {
      handleUpdateFilters({ isFlashSale: "", flashSale: "" });
      return;
    }
    const currentValues = filters[key] ? filters[key].split(",") : [];
    const newValues = currentValues.filter((v) => v !== value.toString());
    handleUpdateFilters({ [key]: newValues.join(",") });
  };

  const isFlashSaleActive = Boolean(
    filters.isFlashSale === "true" ||
      filters.flashSale === "true" ||
      filters.flashSaleOnly
  );

  // Lấy danh sách các bộ lọc đang active để hiển thị Chip
  const activeFilters = React.useMemo(() => {
    const chips = [];
    if (filters.search) {
      chips.push({
        key: "search",
        val: filters.search,
        label: `Từ khóa: "${filters.search}"`,
      });
    }

    if (isFlashSaleActive) {
      chips.push({
        key: "isFlashSale",
        val: "true",
        label: "⚡ Flash Sale",
      });
    }

    const filterKeys = [
      "brandId",
      "categoryId",
      "ram",
      "rom",
      "os",
      "refresh_rate",
      "screen",
      "battery",
    ];

    filterKeys.forEach((key) => {
      if (filters[key]) {
        filters[key].split(",").forEach((val) => {
          let label = val;
          if (key === "brandId")
            label = brands.find((b) => b.id.toString() === val)?.name || val;
          if (key === "categoryId")
            label = categories.find((c) => c.id.toString() === val)?.name || val;

          chips.push({ key, val, label });
        });
      }
    });

    if (filters.minPrice || filters.maxPrice) {
      if (filters.minPrice !== "" || filters.maxPrice !== "") {
        chips.push({
          key: "price",
          val: "range",
          label: `${Number(filters.minPrice || 0).toLocaleString()}₫ - ${Number(filters.maxPrice || 100000000).toLocaleString()}₫`,
        });
      }
    }

    return chips;
  }, [filters, brands, categories, isFlashSaleActive]);

  const [filterLayout, setFilterLayout] = React.useState(() => {
    return localStorage.getItem("tientech_product_filter_layout") || "topbar";
  });

  const handleToggleLayout = React.useCallback(() => {
    setFilterLayout((prev) => {
      const next = prev === "topbar" ? "sidebar" : "topbar";
      localStorage.setItem("tientech_product_filter_layout", next);
      return next;
    });
  }, []);

  return (
    <section className="py-4 md:py-6 bg-white dark:bg-black transition-colors duration-300">
      <div className="container-custom">
        {/* Modern Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 uppercase font-mono">
              <div className="w-6 h-[2px] bg-cyan-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
              <span className="text-[10px] font-bold tracking-[0.2em]">
                COMMAND CENTER // HỆ THỐNG THIẾT BỊ
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {filters.search
                ? `Kết quả cho: "${filters.search}"`
                : isFlashSaleActive
                  ? "Săn Deal Flash Sale"
                  : "Khám Phá Công Nghệ Tương Lai"}
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Mode Toggle Switch */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/90 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setFilterLayout("topbar");
                  localStorage.setItem("tientech_product_filter_layout", "topbar");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterLayout === "topbar"
                    ? "bg-white dark:bg-[#0c101a] text-cyan-600 dark:text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-slate-200 dark:border-cyan-900/50"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Bố cục thanh lọc ngang hiện đại (tối đa diện tích sản phẩm)"
              >
                <FiLayout className="text-xs" />
                <span>Thanh ngang</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterLayout("sidebar");
                  localStorage.setItem("tientech_product_filter_layout", "sidebar");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterLayout === "sidebar"
                    ? "bg-white dark:bg-[#0c101a] text-cyan-600 dark:text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.2)] border border-slate-200 dark:border-cyan-900/50"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Bố cục cột bên truyền thống"
              >
                <FiSidebar className="text-xs" />
                <span>Cột bên</span>
              </button>
            </div>
          </div>
        </div>

        {/* TOPBAR MODE: Horizontal Filter Bar */}
        {filterLayout === "topbar" && (
          <ProductFilter
            filters={filters}
            onFilterChange={(name, val) => handleUpdateFilters({ [name]: val })}
            onClearFilters={handleClearFilters}
            layout="topbar"
            onToggleLayout={handleToggleLayout}
            totalProductsCount={products.length}
          />
        )}

        {/* Active Filter Chips Bar */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4 animate-in fade-in slide-in-from-top-1 duration-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 border-r border-slate-200 dark:border-slate-800 pr-2.5 h-4 flex items-center font-mono">
              Đang kích hoạt:
            </span>
            {activeFilters.map((chip, idx) => (
              <button
                key={`${chip.key}-${chip.val}-${idx}`}
                onClick={() =>
                  chip.key === "price"
                    ? handleUpdateFilters({ minPrice: "", maxPrice: "" })
                    : removeFilterItem(chip.key, chip.val)
                }
                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-500/40 rounded-full text-xs font-mono font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-rose-50 hover:border-rose-400 hover:text-rose-500 transition-all group shadow-[0_0_8px_rgba(6,182,212,0.1)] cursor-pointer"
              >
                <span>{chip.label}</span>
                <FiX className="text-cyan-400 group-hover:text-rose-500 text-xs transition-colors" />
              </button>
            ))}
            <button
              onClick={handleClearFilters}
              className="text-[11px] font-bold text-rose-500 hover:underline uppercase ml-2 tracking-wider flex items-center gap-1 cursor-pointer font-mono"
            >
              <FiRotateCcw className="text-xs" />
              Xóa tất cả
            </button>
          </div>
        )}

        {/* Catalog Sub-Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5 mb-6 border-y border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-mono text-[11px] font-bold">
              [ HIỂN THỊ {products.length} SẢN PHẨM PHÙ HỢP ]
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-mono">
              Tối ưu theo AI Match Rate 2.0
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              SẮP XẾP:
            </label>
            <select
              value={filters.sort || "newest"}
              onChange={(e) => handleUpdateFilters({ sort: e.target.value })}
              className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#0c101a] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="newest">Mới nhất 2025</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="best-seller">Bán chạy nhất (Hot Deals)</option>
            </select>
          </div>
        </div>

        {/* Product Grid Area: Responsive according to layout mode */}
        <div className={filterLayout === "sidebar" ? "flex flex-col lg:flex-row gap-8 lg:gap-10" : "w-full"}>
          {/* SIDEBAR MODE: Column Filter */}
          {filterLayout === "sidebar" && (
            <div className="lg:w-72 flex-shrink-0">
              <ProductFilter
                filters={filters}
                onFilterChange={(name, val) => handleUpdateFilters({ [name]: val })}
                onClearFilters={handleClearFilters}
                layout="sidebar"
                onToggleLayout={handleToggleLayout}
                totalProductsCount={products.length}
              />
            </div>
          )}

          {/* Main Feed */}
          <div className="flex-1 min-w-0">
            {/* Error State */}
            {error && (
              <div className="p-10 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-rose-100 dark:border-rose-900/20 text-center shadow-sm">
                <div className="size-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
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
            {loading && !products.length && !error && renderSkeletons(filterLayout === "topbar" ? 10 : 8)}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="p-16 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-slate-100 border-dashed dark:border-gray-800 text-center shadow-sm">
                <div className="size-20 bg-slate-50 dark:bg-gray-800 text-slate-300 dark:text-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
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
                <div
                  className={
                    filterLayout === "topbar"
                      ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3.5 sm:gap-5 md:gap-6"
                      : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6"
                  }
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {loadingMore && renderSkeletons(filterLayout === "topbar" ? 5 : 4)}

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
