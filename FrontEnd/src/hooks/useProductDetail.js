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
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const [recommended, setRecommended] = useState([]);
  const [smartRecs, setSmartRecs] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
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
    } catch (err) {
      toast.error("Lỗi khi tải thông tin sản phẩm!");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchReviews = useCallback(
    async (page = 1) => {
      if (!product?.id) return;
      try {
        const res = await getReviewsByProductApi(product.id, page, 5);
        if (res.errCode === 0) {
          setReviews(res.data);
          setPagination(res.pagination);
        }
      } catch (err) {
        console.error("Fetch reviews error:", err);
      }
    },
    [product?.id],
  );

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Fetch reviews & recommended & smart recommendations
  useEffect(() => {
    if (product?.id) {
      fetchReviews();
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
    } catch (err) {
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
        fetchReviews(); // Refresh reviews
        return true;
      } else {
        toast.error(res.errMessage || "Lỗi khi gửi đánh giá");
        return false;
      }
    } catch (error) {
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
    pagination,
    recommended,
    smartRecs,
    loadingRecommended,
    addingCart,
    submittingReview,
    handleAddToCart,
    handleReviewSubmit,
    user,
  };
};
