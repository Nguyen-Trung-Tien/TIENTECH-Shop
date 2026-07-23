import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getProductBySlugApi,
  getRecommendedProductsApi,
  getSmartRecommendationsApi,
} from "../api/productApi";
import { getAllCarts, createCart, addCart } from "../api/cartApi";
import { addCartItem } from "../redux/cartSlice";
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

  const [recommended, setRecommended] = useState([]);
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
        toast.error(res.errMessage || "Không tìm thấy sản phẩm!");
      }
    } catch {
      toast.error("Lỗi khi tải thông tin sản phẩm!");
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
          setReviews(res.data);
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

  // Fetch reviews & recommended & smart recommendations
  useEffect(() => {
    if (product?.id) {
      fetchReviews(1, "", false);
      const fetchExtra = async () => {
        try {
          const recommendedRes = await getRecommendedProductsApi(
            product.id,
            1,
            6,
          );
          if (recommendedRes.errCode === 0) {
            setRecommended(recommendedRes.data);
          }

          const smartRecsRes = await getSmartRecommendationsApi(product.id, 4);
          if (smartRecsRes.errCode === 0) {
            setSmartRecs(smartRecsRes.products);
          }
        } catch (err) {
          console.error("Fetch extra data error:", err);
        }
      };
      fetchExtra();
    }
  }, [product?.id, fetchReviews]);

  const handleAddToCart = async (variantId, quantity = 1) => {
    if (!userId) {
      toast.warn("Bạn cần đăng nhập để mua hàng!");
      return null;
    }
    if (!variantId && product?.variants?.length > 0) {
      toast.warn("Vui lòng chọn phiên bản sản phẩm!");
      return null;
    }

    setAddingCart(true);
    try {
      const cartsRes = await getAllCarts();
      let cart = cartsRes.data.find((c) => c.userId === userId);
      if (!cart) {
        const newCartRes = await createCart(userId);
        cart = newCartRes.data;
      }

      const res = await addCart({
        cartId: cart.id,
        productId: product.id,
        variantId: variantId || null, // Ensure proper null value for products without variants
        quantity,
      });

      if (res.errCode === 0) {
        dispatch(addCartItem(res.data));
        toast.success("Đã thêm vào giỏ hàng!");
        return res.data; // Trả về item vừa thêm
      } else {
        toast.error(res.errMessage);
        return null;
      }
    } catch {
      toast.error("Lỗi khi thêm vào giỏ hàng!");
      return null;
    } finally {
      setAddingCart(false);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    if (!user) return toast.warn("Vui lòng đăng nhập để đánh giá!");
    setSubmittingReview(true);
    try {
      const res = await createReviewApi({
        productId: product.id,
        ...reviewData,
      });
      if (res.errCode === 0) {
        toast.success("Cảm ơn bạn đã đánh giá!");
        fetchReviews(1, ratingFilter, hasImageFilter); // Refresh reviews
        return true;
      } else {
        toast.error(res.errMessage || "Lỗi khi gửi đánh giá");
        return false;
      }
    } catch {
      toast.error("Không thể gửi đánh giá lúc này");
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
    recommended,
    smartRecs,
    addingCart,
    submittingReview,
    handleAddToCart,
    handleReviewSubmit,
    user,
  };
};
