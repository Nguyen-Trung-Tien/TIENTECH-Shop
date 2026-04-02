import React, { useMemo } from "react";
import { useProductList } from "../../hooks/useProductList";
import ProductCard from "../../components/ProductCard/ProductCard";
import ProductFilter from "../../components/ProductFilter/ProductFilter";
import LoadMoreButton from "../../components/LoadMoreButton/LoadMoreButton";
import SkeletonCard from "../../components/SkeletonCard/SkeletonCard";
import ChatBot from "../../components/ChatBot/ChatBot";
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs";
import { FiFilter, FiSearch, FiAlertCircle, FiGrid } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { useParams, useLocation } from "react-router-dom";

const ProductListPage = () => {
  const { slug } = useParams();
  const location = useLocation();
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
  } = useProductList(12);

  const [showMobileFilter, setShowMobileFilter] = React.useState(false);

  const isCategory = location.pathname.includes("/category/");
  const isBrand = location.pathname.includes("/brand/");

  const pageTitle = useMemo(() => {
    if (filters.search) return `Kết quả: "${filters.search}"`;
    if (isCategory && slug) return slug.replace(/-/g, " ").toUpperCase();
    if (isBrand && slug)
      return `THƯƠNG HIỆU: ${slug.replace(/-/g, " ").toUpperCase()}`;
    return "TẤT CẢ SẢN PHẨM";
  }, [filters.search, isCategory, isBrand, slug]);

  return (
    <main className="min-h-screen bg-slate-50/50 pb-24">
      <ChatBot />

      {/* Page Header - Tối ưu phân cấp thị giác */}
      <section className="bg-white border-b border-slate-100 pt-16 pb-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 skew-x-12 translate-x-20 transition-all duration-1000"></div>
        <div className="container-custom relative z-10">
          <div className="max-w-2xl">
            <Breadcrumbs />
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
              {pageTitle}
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Hệ thống phân phối linh kiện máy tính & giải pháp công nghệ hàng
              đầu Việt Nam.
            </p>
          </div>
        </div>
      </section>

      <div className="container-custom mt-12">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10">
          {/* Sidebar Filter - Desktop & Mobile */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <button
                  onClick={() => setShowMobileFilter(true)}
                  className="flex items-center gap-2 px-6 h-12 bg-white rounded-xl text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm border border-slate-200"
                >
                  <FiFilter /> Bộ lọc
                </button>
              </div>

              <div className="hidden lg:block">
                <ProductFilter
                  isSidebar={true}
                  onFilterChange={handleUpdateFilters}
                  initialFilters={filters}
                />
              </div>
            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
              {showMobileFilter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[200] lg:hidden bg-slate-900/60 backdrop-blur-sm p-4"
                >
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    className="bg-white h-full w-full max-w-sm ml-auto rounded-3xl overflow-hidden flex flex-col shadow-2xl"
                  >
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="text-lg font-black uppercase tracking-tight">
                        Bộ lọc
                      </h2>
                      <button
                        onClick={() => setShowMobileFilter(false)}
                        className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400"
                      >
                        <FiGrid />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                      <ProductFilter
                        onFilterChange={handleUpdateFilters}
                        initialFilters={filters}
                        onClose={() => setShowMobileFilter(false)}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>

          {/* Product Content Area */}
          <div className="lg:col-span-9">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  {products.length}{" "}
                  <span className="text-slate-400 font-bold ml-1">
                    Sản phẩm tìm thấy
                  </span>
                </span>
              </div>
            </div>

            {/* Grid Area */}
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="bg-white rounded-[32px] border border-rose-100 p-16 text-center shadow-soft">
                <FiAlertCircle
                  className="mx-auto text-rose-500 mb-6"
                  size={40}
                />
                <h3 className="text-lg font-black text-slate-900 mb-2 uppercase">
                  Lỗi tải dữ liệu
                </h3>
                <p className="text-slate-400 text-sm mb-8 font-medium">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-blue-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-[32px] border-2 border-dashed border-slate-200 p-24 text-center">
                <FiSearch className="mx-auto text-slate-200 mb-6" size={56} />
                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase italic">
                  Không tìm thấy
                </h3>
                <p className="text-slate-400 font-medium text-sm">
                  Thử thay đổi bộ lọc để tìm kiếm kết quả khác.
                </p>
              </div>
            ) : (
              <div className="space-y-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-10">
                  <AnimatePresence>
                    {products.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: (idx % 3) * 0.05 }}
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Load More & Pagination Indicator */}
                <div className="flex flex-col items-center gap-8 pt-10 border-t border-slate-100">
                  {currentPage < totalPages && (
                    <LoadMoreButton
                      page={currentPage}
                      totalPages={totalPages}
                      loadingMore={loadingMore}
                      onLoadMore={handleLoadMore}
                    />
                  )}
                  <span className="px-6 py-2 bg-slate-100 rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
                    Trang {currentPage} / {totalPages}
                  </span>
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
