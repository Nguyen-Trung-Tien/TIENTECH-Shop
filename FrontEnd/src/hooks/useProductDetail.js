import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { showErrorToast, showSuccessToast, showWarningToast } from "../utils/toastHelper";
import {
  getProductBySlugApi,
  getSmartRecommendationsApi,
} from "../api/productApi";
import { addCart } from "../api/cartApi";
import { addCartItem, addGuestCartItem } from "../redux/cartSlice";
import { buildGuestCartItem } from "../utils/guestCart";
import { getReviewsByProductApi, createReviewApi } from "../api/reviewApi";

export const useProductDetail = (slug) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewsSummary, setReviewsSummary] = useState({
    totalReviews: 0,
    averageRating: 5.0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [reviewPage, setReviewPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState("");
  const [hasImageFilter, setHasImageFilter] = useState(false);
  const [pagination, setPagination] = useState({ totalPages: 1, currentPage: 1, totalItems: 0 });

  const [smartRecs, setSmartRecs] = useState([]);
  const [addingCart, setAddingCart] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product data by Slug
  const fetchProduct = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await getProductBySlugApi(slug);
      if (res?.errCode === 0 && res.product) {
        setProduct(res.product);
      } else {
        showErrorToast(res.errMessage || "Không tìm thấy sản phẩm!");
      }
    } catch {
      showErrorToast("Lỗi khi tải thông tin sản phẩm!");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchReviews = useCallback(
    async (page = 1, rating = ratingFilter, hasImage = hasImageFilter) => {
      if (!product?.id) return;
      try {
        const res = await getReviewsByProductApi(
          product.id,
          page,
          5,
          rating,
          hasImage,
        );
        if (res.errCode === 0) {
          setReviews(res.data || []);
          if (res.summary) setReviewsSummary(res.summary);
          if (res.pagination) setPagination(res.pagination);
        }
      } catch (err) {
        console.error("Fetch reviews error:", err);
      }
    },
    [product?.id, ratingFilter, hasImageFilter],
  );

  const changeReviewPage = (page) => {
    setReviewPage(page);
    fetchReviews(page, ratingFilter, hasImageFilter);
  };

  const changeReviewFilter = (rating, hasImage = false) => {
    setRatingFilter(rating);
    setHasImageFilter(hasImage);
    setReviewPage(1);
    fetchReviews(1, rating, hasImage);
  };

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Fetch reviews independently from recommendation fetches
  useEffect(() => {
    if (product?.id) {
      fetchReviews(1, ratingFilter, hasImageFilter);
    }
  }, [product?.id, fetchReviews, ratingFilter, hasImageFilter]);

  // Fetch smart recommendations once per product
  useEffect(() => {
    if (!product?.id) return;
    let isCancelled = false;
    const fetchExtra = async () => {
      try {
        const smartRecsRes = await getSmartRecommendationsApi(product.id, 4);
        if (!isCancelled && smartRecsRes?.errCode === 0) {
          setSmartRecs(smartRecsRes.products || []);
        }
      } catch (err) {
        console.error("Fetch extra data error:", err);
      }
    };
    fetchExtra();
    return () => {
      isCancelled = true;
    };
  }, [product?.id]);

  const handleAddToCart = async (variantId, quantity = 1, showToast = true) => {
    if (!variantId && product?.variants?.length > 0) {
      showWarningToast("Vui lòng chọn phiên bản sản phẩm!");
      return null;
    }

    const selectedVariant = variantId
      ? product?.variants?.find((v) => Number(v.id) === Number(variantId)) || null
      : null;

    // Guest Cart support via localStorage + cartSlice
    if (!userId) {
      const guestItem = buildGuestCartItem({
        product,
        variant: selectedVariant,
        quantity,
      });
      dispatch(
        addGuestCartItem({
          product,
          variant: selectedVariant,
          quantity,
        }),
      );
      if (showToast) {
        showSuccessToast("Đã thêm vào giỏ hàng!");
      }
      return guestItem;
    }

    setAddingCart(true);
    try {
      const res = await addCart({
        productId: product.id,
        variantId: variantId || null,
        quantity,
      });

      if (res.errCode === 0) {
        dispatch(addCartItem(res.data));
        if (showToast) {
          showSuccessToast("Đã thêm vào giỏ hàng!");
        }
        return res.data; // Trả về item vừa thêm
      } else {
        showErrorToast(res.errMessage, "Không thể thêm vào giỏ hàng");
        return null;
      }
    } catch (err) {
      showErrorToast(err, "Không thể thêm vào giỏ hàng!");
      return null;
    } finally {
      setAddingCart(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    if (!user) return showWarningToast("Vui lòng đăng nhập để đánh giá!");
    setSubmittingReview(true);
    try {
      const res = await createReviewApi({
        productId: product.id,
        ...reviewData,
      });
      if (res.errCode === 0) {
        showSuccessToast("Cảm ơn bạn đã đánh giá!");
        fetchReviews(1, ratingFilter, hasImageFilter); // Refresh reviews
        return true;
      } else {
        showErrorToast(res.errMessage, "Không thể gửi đánh giá");
        return false;
      }
    } catch (err) {
      showErrorToast(err, "Không thể gửi đánh giá lúc này");
      return false;
    } finally {
      setSubmittingReview(false);
    }
  };

  return {
    product,
    loading,
    reviews,
    reviewsSummary,
    reviewPage,
    ratingFilter,
    hasImageFilter,
    pagination,
    changeReviewPage,
    changeReviewFilter,
    fetchReviews,
    smartRecs,
    addingCart,
    submittingReview,
    handleAddToCart,
    handleReviewSubmit,
    user,
  };
};
