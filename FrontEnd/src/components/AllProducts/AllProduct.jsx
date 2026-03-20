import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard/ProductCard";
import SkeletonCard from "../SkeletonCard/SkeletonCard";
import { getAllProductApi, searchProductsApi } from "../../api/productApi";
import LoadMoreButton from "../LoadMoreButton/LoadMoreButton";
import { FiRefreshCw, FiAlertCircle, FiSearch } from "react-icons/fi";

const AllProducts = React.memo(() => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(false);
  const [flashSaleOnly, setFlashSaleOnly] = useState(false);
  const limit = 12;

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const fetchProducts = useCallback(
    async (currentPage = 1, append = false) => {
      try {
        if (append) setLoadingMore(true);
        else {
          setLoading(true);
          setError(false);
        }

        const res = searchQuery
          ? await searchProductsApi(searchQuery, currentPage, limit)
          : await getAllProductApi(currentPage, limit, "", flashSaleOnly);

        if (res?.errCode === 0) {
          const newProducts = res?.products || [];

          setProducts((prev) =>
            append ? [...prev, ...newProducts] : newProducts,
          );

          setTotalPages(res.totalPages || 1);
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
    [searchQuery, limit, flashSaleOnly],
  );

  useEffect(() => {
    setPage(1);
    setProducts([]);
    setError(false);
    fetchProducts(1, false);
  }, [fetchProducts, flashSaleOnly]);

  const handleLoadMore = () => {
    if (page >= totalPages || loadingMore) return;
    fetchProducts(page + 1, true);
  };

  const renderSkeletons = (count = 10) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={`skeleton-${i}`} />
      ))}
    </div>
  );

  return (
    <section className="py-12 bg-surface-50 min-h-screen">
      <div className="container-custom">
        {/* Header Section */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-2xl text-primary mb-4">
            <FiSearch className="text-2xl" />
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-surface-900 tracking-tight">
            {searchQuery
              ? `Kết quả tìm kiếm: "${searchQuery}"`
              : flashSaleOnly
                ? "Sản phẩm Flash Sale"
                : "Tất cả sản phẩm công nghệ"}
          </h2>
          <div className="mt-2 h-1 w-20 bg-primary rounded-full"></div>

          <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={flashSaleOnly}
                onChange={(e) => setFlashSaleOnly(e.target.checked)}
                className="form-checkbox h-4 w-4 text-primary"
              />
              Chỉ Flash Sale
            </label>
            <span>Hiện tại: {flashSaleOnly ? "Flash Sale" : "Toàn bộ"}</span>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto p-6 bg-rose-50 border border-rose-100 rounded-2xl text-center">
            <FiAlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <p className="text-rose-900 font-bold mb-4">
              Đã có lỗi xảy ra khi tải sản phẩm.
            </p>
            <button
              onClick={() => fetchProducts(1, false)}
              className="inline-flex items-center gap-2 px-6 py-2 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
            >
              <FiRefreshCw /> Thử lại
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !products.length && !error && renderSkeletons(12)}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="max-w-md mx-auto p-12 bg-white rounded-3xl border border-surface-200 text-center shadow-soft">
            <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiSearch className="text-3xl text-surface-400" />
            </div>
            <h3 className="text-lg font-bold text-surface-900 mb-2">
              Không tìm thấy sản phẩm
            </h3>
            <p className="text-surface-500 text-sm">
              Chúng tôi không tìm thấy kết quả phù hợp với từ khóa của bạn. Vui
              lòng thử lại với từ khóa khác.
            </p>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {loadingMore && renderSkeletons(6)}

            <div className="flex justify-center pt-8">
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
    </section>
  );
});

export default AllProducts;
