import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useParams, useLocation } from "react-router-dom";
import { filterProductsApi } from "../api/productApi";

/**
 * Hook quản lý danh sách sản phẩm với bộ lọc nâng cao
 */
export const useProductList = (limit = 12) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  // Xác định type từ URL path
  const isCategory = location.pathname.includes("/category/");
  const isBrand = location.pathname.includes("/brand/");

  // Định nghĩa danh sách các thuộc tính lọc hỗ trợ
  const ATTRIBUTE_KEYS = ["ram", "rom", "os", "screen", "battery", "refresh_rate"];

  // Lấy các filter từ URL
  const filtersFromUrl = useMemo(() => {
    const filters = {
      brand: isBrand ? slug : (searchParams.get("brandId") || ""),
      category: isCategory ? slug : (searchParams.get("categoryId") || ""),
      search: searchParams.get("search") || "",
      minPrice: Number(searchParams.get("minPrice")) || 0,
      maxPrice: Number(searchParams.get("maxPrice")) || 100000000,
      sort: searchParams.get("sort") || "",
    };

    // Thêm các thuộc tính động
    ATTRIBUTE_KEYS.forEach(key => {
      const val = searchParams.get(key);
      if (val) filters[key] = val;
    });

    return filters;
  }, [searchParams, slug, isCategory, isBrand]);

  const fetchProducts = useCallback(
    async (page = 1, append = false) => {
      try {
        append ? setLoadingMore(true) : setLoading(true);
        setError("");

        // Chuẩn bị params cho API
        const apiParams = {
          brand: isBrand ? filtersFromUrl.brand : undefined,
          category: isCategory ? filtersFromUrl.category : undefined,
          brandId: !isBrand ? filtersFromUrl.brand : undefined,
          categoryId: !isCategory ? filtersFromUrl.category : undefined,
          search: filtersFromUrl.search,
          minPrice: filtersFromUrl.minPrice,
          maxPrice: filtersFromUrl.maxPrice,
          sort: filtersFromUrl.sort,
          os: filtersFromUrl.os,
          refresh_rate: filtersFromUrl.refresh_rate,
          page,
          limit,
        };

        // Gán thêm các thuộc tính attributes vào apiParams
        ATTRIBUTE_KEYS.forEach(key => {
          if (filtersFromUrl[key]) apiParams[key] = filtersFromUrl[key];
        });

        const res = await filterProductsApi(apiParams);

        if (res.errCode === 0) {
          const newProducts = res.products || res.data || [];
          setProducts((prev) => (append ? [...prev, ...newProducts] : newProducts));
          
          const pagination = res.pagination || {};
          setCurrentPage(pagination.currentPage || page);
          setTotalPages(pagination.totalPages || 1);
        } else {
          throw new Error(res.errMessage || "Lỗi tải sản phẩm");
        }
      } catch (err) {
        console.error("Fetch products error:", err);
        setError("Không thể kết nối máy chủ. Vui lòng thử lại.");
        if (!append) setProducts([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filtersFromUrl, limit, isBrand, isCategory]
  );

  // Tự động fetch khi bộ lọc thay đổi
  useEffect(() => {
    fetchProducts(1, false);
  }, [fetchProducts]);

  const handleUpdateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    params.delete("page");

    Object.entries(newFilters).forEach(([key, value]) => {
      const paramKey = key === 'brand' ? 'brandId' : (key === 'category' ? 'categoryId' : key);
      
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        if (Array.isArray(value)) params.set(paramKey, value.join(','));
        else params.set(paramKey, value);
      } else {
        params.delete(paramKey);
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
