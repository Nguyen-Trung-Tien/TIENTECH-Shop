import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import SkeletonCard from "../SkeletonCard/SkeletonCard";
import { filterProductsApi, getFlashSaleProductsApi } from "../../api/productApi";
import LoadMoreButton from "../LoadMoreButton/LoadMoreButton";
import ProductFilter from "./ProductFilter";
import { FiRefreshCw, FiAlertCircle, FiSearch, FiLayers, FiZap, FiGrid } from "react-icons/fi";

const AllProducts = React.memo(() => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Danh sách các key thuộc tính hỗ trợ lọc
  const ATTR_KEYS = ["ram", "rom", "os", "refresh_rate", "screen", "battery"];

  // Filter States - Đồng bộ với URL
  const filters = useMemo(() => {
    const f = {
      search: searchParams.get("search") || "",
      categoryId: searchParams.get("categoryId") || "",
      brandId: searchParams.get("brandId") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "newest",
      flashSaleOnly: searchParams.get("flashSale") === "true",
    };

    // Thêm các thuộc tính động vào filters object
    ATTR_KEYS.forEach(key => {
      const val = searchParams.get(key);
      if (val) f[key] = val;
    });

    return f;
  }, [searchParams]);

  const limit = 12;

  const fetchProducts = useCallback(
    async (currentPage = 1, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else {
          setLoading(true);
          setError(false);
        }

        let res;
        if (filters.flashSaleOnly) {
          res = await getFlashSaleProductsApi(currentPage, limit);
        } else {
          // Gửi toàn bộ filters object lên API
          res = await filterProductsApi({
            ...filters,
            page: currentPage,
            limit,
          });
        }

        if (res?.errCode === 0) {
          const newProducts = res?.products || res?.data || [];
          const totalP = res?.pagination?.totalPages || 1;

          setProducts((prev) =>
            append ? [...prev, ...newProducts] : newProducts,
          );

          setTotalPages(totalP);
          setPage(currentPage);
        } else {
          throw new Error(res?.errMessage || "Lỗi tải sản phẩm");
        }
      } catch (err) {
        console.error("Fetch products error:", err);
        setError(true);
        toast.error("Không thể tải sản phẩm. Vui lòng thử lại!");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, limit],
  );

  // Fetch lại mỗi khi filters thay đổi (từ URL)
  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  const handleFilterChange = (name, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(name, value);
    } else {
      newParams.delete(name);
    }
    newParams.delete("page"); // Reset về trang 1
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const handleLoadMore = () => {
    if (page >= totalPages || loadingMore) return;
    fetchProducts(page + 1, true);
  };

  const renderSkeletons = (count = 8) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={`skeleton-${i}`} />
      ))}
    </div>
  );

  return (
    <section className="py-20 bg-slate-50/30">
      <div className="container-custom">
        {/* Modern Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-primary">
               <div className="w-8 h-[2px] bg-primary rounded-full"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.3em]">Hệ thống sản phẩm</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {filters.search
                ? `Kết quả cho: "${filters.search}"`
                : filters.flashSaleOnly
                  ? "Săn Deal Hot"
                  : "Khám phá Công nghệ"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Flash Sale Toggle */}
            <button
              onClick={() => handleFilterChange("flashSale", filters.flashSaleOnly ? "" : "true")}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                filters.flashSaleOnly 
                  ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200" 
                  : "bg-white border-slate-200 text-slate-600 hover:border-orange-300"
              }`}
            >
              <FiZap className={filters.flashSaleOnly ? "fill-current" : ""} /> Flash Sale
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
               <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl px-6 py-3 pr-10 shadow-sm outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all cursor-pointer"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                 <FiLayers size={12} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Dynamic Sidebar Filter */}
          <ProductFilter 
            filters={filters} 
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />

          {/* Main Feed */}
          <div className="flex-1 min-w-0">
            {/* Error State */}
            {error && (
              <div className="p-12 bg-white rounded-[3rem] border border-rose-100 text-center shadow-soft">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <FiAlertCircle size={32} />
                </div>
                <p className="text-slate-900 font-black text-lg mb-2">Đã có lỗi xảy ra</p>
                <p className="text-slate-500 text-sm mb-8">Không thể kết nối với máy chủ để tải sản phẩm.</p>
                <button
                  onClick={() => fetchProducts(1, false)}
                  className="px-8 py-3 bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
                >
                  Thử lại ngay
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && !products.length && !error && renderSkeletons(8)}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="p-20 bg-white rounded-[3rem] border border-slate-100 text-center shadow-soft">
                <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-8">
                  <FiSearch size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  Rất tiếc, không tìm thấy sản phẩm
                </h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed font-medium">
                  Chúng tôi không tìm thấy sản phẩm nào phù hợp với các tiêu chí lọc hiện tại của bạn. Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all active:scale-95"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}

            {/* Product Grid */}
            {!loading && !error && products.length > 0 && (
              <div className="space-y-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-10">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {loadingMore && renderSkeletons(4)}

                <div className="flex justify-center pt-10 border-t border-slate-50">
                  <LoadMoreButton
                    currentPage={page}
                    totalPages={totalPages}
                    loading={loadingMore}
                    onLoadMore={handleLoadMore}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

export default AllProducts;
