import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import { getAllCategoryApi } from "../../api/categoryApi";
import { filterProductsApi } from "../../api/productApi";
import ChatBot from "../../components/ChatBot/ChatBot";
import SkeletonCard from "../../components/SkeletonCard/SkeletonCard";
import ProductFilter from "../../components/ProductFilter/ProductFilter";
import LoadMoreButton from "../../components/LoadMoreButton/LoadMoreButton";
import { FiFilter, FiX, FiInfo, FiRefreshCw, FiGrid, FiSearch, FiAlertCircle, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ProductListPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({});
  const brandIdParam = searchParams.get("brandId") || "";
  const categoryIdParam = searchParams.get("categoryId") || "";
  const searchQueryParam = searchParams.get("search") || "";

  const limit = 12;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategoryApi();
        if (res.errCode === 0) setCategories(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(
    async (page = 1, filters = {}, append = false) => {
      try {
        append ? setLoadingMore(true) : setLoading(true);
        setError("");

        const res = await filterProductsApi({
          brandId: filters.brand || brandIdParam || "",
          categoryId: filters.category || categoryIdParam || "",
          search: searchQueryParam || "",
          minPrice: filters.price?.[0] ?? 0,
          maxPrice: filters.price?.[1] ?? 100000000,
          sort: filters.sort || "",
          page,
          limit,
        });

        if (res.errCode === 0) {
          const newProducts = res.products || res.data || [];
          setProducts((prev) => append ? [...prev, ...newProducts] : newProducts);
          setCurrentPage(res.currentPage || page);
          setTotalPages(res.totalPages || 1);
        } else {
          throw new Error(res.errMessage || "Lỗi tải sản phẩm");
        }
      } catch (err) {
        console.error(err);
        setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
        if (!append) setProducts([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [categoryIdParam, brandIdParam, searchQueryParam],
  );

  const initialFilters = React.useMemo(() => ({
    brand: brandIdParam,
    category: categoryIdParam,
  }), [brandIdParam, categoryIdParam]);

  useEffect(() => {
    fetchProducts(1, appliedFilters, false);
  }, [appliedFilters, fetchProducts]);

  const handleFilterChange = (newFilters) => {
    setAppliedFilters(newFilters);
    // fetchProducts(1, newFilters, false); // Triggered by useEffect above
  };

  const handleLoadMore = () => {
    if (currentPage >= totalPages || loadingMore) return;
    fetchProducts(currentPage + 1, appliedFilters, true);
  };

  return (
    <main className="min-h-screen bg-slate-50/50 pb-24">
      <ChatBot />

      {/* Page Header */}
      <section className="bg-white border-b border-slate-100 pt-16 pb-12 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 skew-x-12 translate-x-20"></div>
         <div className="container-custom relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
               <div className="max-w-2xl">
                  <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                     <span>Cửa hàng</span>
                     <FiChevronRight />
                     <span className="text-primary">Tất cả sản phẩm</span>
                  </nav>
                  <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
                     {searchQueryParam ? (
                        <>Kết quả: <span className="text-primary italic">"{searchQueryParam}"</span></>
                     ) : (
                        <>KHÁM PHÁ <br/> <span className="text-primary">CÔNG NGHỆ</span></>
                     )}
                  </h1>
                  <p className="text-slate-500 font-medium">Hệ thống phân phối linh kiện máy tính & giải pháp công nghệ hàng đầu.</p>
               </div>
               <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 lg:hidden">
                  <button 
                    onClick={() => setShowMobileFilter(true)}
                    className="flex items-center gap-2 px-6 h-12 bg-white rounded-xl text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm border border-slate-200"
                  >
                    <FiFilter /> Bộ lọc
                  </button>
               </div>
            </div>
         </div>
      </section>

      <div className="container-custom mt-12">
        <div className="flex flex-col lg:flex-row gap-12">
           
           {/* Sidebar Filter - Desktop */}
           <aside className="hidden lg:block w-80 flex-shrink-0 sticky top-24 self-start">
              <ProductFilter 
                isSidebar={true} 
                onFilterChange={handleFilterChange} 
                initialFilters={initialFilters}
              />
           </aside>

           {/* Mobile Filter Drawer */}
           <ProductFilter 
             onFilterChange={handleFilterChange} 
             onClose={() => setShowMobileFilter(false)} 
             show={showMobileFilter}
             initialFilters={initialFilters}
           />

           {/* Product Content Area */}
           <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-black text-slate-900 uppercase tracking-widest">
                       {products.length} <span className="text-slate-400 font-bold ml-1">Sản phẩm tìm thấy</span>
                    </span>
                 </div>
                 
                 <div className="flex items-center gap-4">
                    {/* Sort display or other quick tools can go here */}
                 </div>
              </div>

              {/* Grid Area */}
              {loading && products.length === 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                  {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : error ? (
                <div className="bg-white rounded-[3rem] border border-rose-100 p-20 text-center shadow-soft">
                   <FiAlertCircle className="mx-auto text-rose-500 mb-6" size={48} />
                   <h3 className="text-xl font-black text-slate-900 mb-4 uppercase">Đã có lỗi</h3>
                   <p className="text-slate-500 mb-8">{error}</p>
                   <button onClick={() => fetchProducts(1, appliedFilters, false)} className="h-14 px-10 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20">Thử lại</button>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-32 text-center">
                   <FiSearch className="mx-auto text-slate-200 mb-8" size={64} />
                   <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight italic">Không có dữ liệu</h3>
                   <p className="text-slate-400 font-medium">Thử thay đổi tiêu chí lọc để tìm thấy nhiều sản phẩm hơn.</p>
                </div>
              ) : (
                <div className="space-y-16">
                  <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-12">
                    {products.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: (idx % 4) * 0.1 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col items-center gap-10 pt-16 border-t border-slate-100">
                    {currentPage < totalPages && (
                      <LoadMoreButton
                        page={currentPage}
                        totalPages={totalPages}
                        loadingMore={loadingMore}
                        onLoadMore={handleLoadMore}
                      />
                    )}
                    <div className="px-6 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
                       Trang {currentPage} / {totalPages}
                    </div>
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </main>
  );
};

export default ProductListPage;
