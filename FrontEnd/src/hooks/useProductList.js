import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { filterProductsApi } from "../api/productApi";

export const useProductList = (limit = 12) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  // Lấy các filter từ URL
  const filtersFromUrl = useMemo(() => ({
    brand: searchParams.get("brandId") || "",
    category: searchParams.get("categoryId") || "",
    search: searchParams.get("search") || "",
    minPrice: Number(searchParams.get("minPrice")) || 0,
    maxPrice: Number(searchParams.get("maxPrice")) || 100000000,
    sort: searchParams.get("sort") || "",
  }), [searchParams]);

  const fetchProducts = useCallback(
    async (page = 1, append = false) => {
      try {
        append ? setLoadingMore(true) : setLoading(true);
        setError("");

        const res = await filterProductsApi({
          brandId: filtersFromUrl.brand,
          categoryId: filtersFromUrl.category,
          search: filtersFromUrl.search,
          minPrice: filtersFromUrl.minPrice,
          maxPrice: filtersFromUrl.maxPrice,
          sort: filtersFromUrl.sort,
          page,
          limit,
        });

        if (res.errCode === 0) {
          const newProducts = res.products || res.data || [];
          setProducts((prev) => (append ? [...prev, ...newProducts] : newProducts));
          setCurrentPage(res.currentPage || page);
          setTotalPages(res.totalPages || 1);
        } else {
          throw new Error(res.errMessage || "Lỗi tải sản phẩm");
        }
      } catch (err) {
        setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
        if (!append) setProducts([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filtersFromUrl, limit],
  );

  // Tự động fetch khi URL thay đổi
  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  const handleUpdateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    
    // Cập nhật các param mới
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        if (key === 'brand') params.set('brandId', value);
        else if (key === 'category') params.set('categoryId', value);
        else params.set(key, value);
      } else {
        if (key === 'brand') params.delete('brandId');
        else if (key === 'category') params.delete('categoryId');
        else params.delete(key);
      }
    });
    
    setSearchParams(params);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loadingMore) {
      fetchProducts(currentPage + 1, true);
    }
  };

  return {
    products,
    loading,
    loadingMore,
    currentPage,
    totalPages,
    error,
    filters: filtersFromUrl,
    handleUpdateFilters,
    handleLoadMore,
  };
};
