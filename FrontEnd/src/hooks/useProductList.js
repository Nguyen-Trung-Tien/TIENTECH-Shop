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
      search: searchParams.get("search") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      sort: searchParams.get("sort") || "",
      // Luôn lấy từ SearchParams trước để ủng hộ việc đa chọn
      brandId: searchParams.get("brandId") || "",
      categoryId: searchParams.get("categoryId") || "",
    };

    // Hỗ trợ fallback cho tham số 'price' dạng 'min,max' nếu có
    const priceRange = searchParams.get("price");
    if (priceRange && priceRange.includes(",")) {
      const [min, max] = priceRange.split(",");
      if (!filters.minPrice) filters.minPrice = min;
      if (!filters.maxPrice) filters.maxPrice = max;
    }

    // Nếu không có trong SearchParams nhưng có trong URL slug (trang Brand/Category)
    if (!filters.brandId && isBrand && slug) {
      filters.brand = slug;
    }
    if (!filters.categoryId && isCategory && slug) {
      filters.category = slug;
    }

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
          ...filtersFromUrl,
          page,
          limit,
        };

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
