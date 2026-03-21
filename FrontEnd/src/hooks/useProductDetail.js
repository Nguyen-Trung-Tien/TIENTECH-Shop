import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getProductBySlugApi, getRecommendedProductsApi } from "../api/productApi";
import { getAllCarts, createCart, addCart } from "../api/cartApi";
import { addCartItem } from "../redux/cartSlice";
import { getReviewsByProductApi } from "../api/reviewApi";

export const useProductDetail = (slug) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  
  const [recommended, setRecommended] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [addingCart, setAddingCart] = useState(false);

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

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Fetch reviews & recommended (giả sử dùng product.id sau khi fetch xong)
  useEffect(() => {
    if (product?.id) {
      const fetchExtra = async () => {
        try {
          const [reviewsRes, recommendedRes] = await Promise.all([
            getReviewsByProductApi(product.id, 1, 5),
            getRecommendedProductsApi(product.id, 1, 6)
          ]);
          if (reviewsRes.errCode === 0) {
            setReviews(reviewsRes.data);
            setPagination(reviewsRes.pagination);
          }
          if (recommendedRes.errCode === 0) {
            setRecommended(recommendedRes.data);
          }
        } catch (err) {
          console.error("Fetch extra data error:", err);
        }
      };
      fetchExtra();
    }
  }, [product?.id]);

  const handleAddToCart = async (variantId, quantity = 1) => {
    if (!userId) return toast.warn("Bạn cần đăng nhập để mua hàng!");
    if (!variantId && product?.variants?.length > 0) return toast.warn("Vui lòng chọn phiên bản sản phẩm!");

    setAddingCart(true);
    try {
      const cartsRes = await getAllCarts();
      let cart = cartsRes.data.find(c => c.userId === userId);
      if (!cart) {
        const newCartRes = await createCart(userId);
        cart = newCartRes.data;
      }

      const res = await addCart({ 
        cartId: cart.id, 
        productId: product.id, 
        variantId, 
        quantity 
      });

      if (res.errCode === 0) {
        dispatch(addCartItem(res.data));
        toast.success("Đã thêm vào giỏ hàng!");
        return true; // Trả về true khi thành công
      } else {
        toast.error(res.errMessage);
        return false;
      }
    } catch (err) {
      toast.error("Lỗi khi thêm vào giỏ hàng!");
      return false;
    } finally {
      setAddingCart(false);
    }
  };

  return {
    product,
    loading,
    reviews,
    pagination,
    recommended,
    loadingRecommended,
    addingCart,
    handleAddToCart,
    user
  };
};
