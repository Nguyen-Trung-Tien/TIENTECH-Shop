import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getProductByIdApi, getRecommendedProductsApi } from "../api/productApi";
import { getAllCarts, createCart, addCart } from "../api/cartApi";
import { addCartItem } from "../redux/cartSlice";
import { getReviewsByProductApi } from "../api/reviewApi";

export const useProductDetail = (productId) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  
  const [recommended, setRecommended] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [recommendedTotalPages, setRecommendedTotalPages] = useState(1);
  
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingCart, setAddingCart] = useState(false);

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProductByIdApi(productId);
      if (res?.errCode === 0 && res.product) {
        setProduct(res.product);
        if (res.product.variants?.length > 0) {
          const firstActive = res.product.variants.find(v => v.isActive) || res.product.variants[0];
          setSelectedVariantId(firstActive?.id || null);
        }
      }
    } catch (err) {
      toast.error("Lỗi khi tải thông tin sản phẩm!");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  // Fetch reviews
  const fetchReviews = useCallback(async (page = 1) => {
    try {
      const res = await getReviewsByProductApi(productId, page, 3);
      if (res?.errCode === 0) {
        setReviews(res.data || []);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Fetch reviews error:", err);
    }
  }, [productId]);

  // Fetch recommended products
  const fetchRecommended = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) setLoadingRecommended(true);
      const res = await getRecommendedProductsApi(productId, page, 6);
      if (res?.errCode === 0) {
        setRecommended(prev => append ? [...prev, ...res.data] : res.data);
        setRecommendedTotalPages(res.pagination?.totalPages || 1);
        setRecommendedPage(page);
      }
    } finally {
      setLoadingRecommended(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchReviews(1);
    }
  }, [productId, fetchProduct, fetchReviews]);

  useEffect(() => {
    if (product) fetchRecommended(1);
  }, [product, fetchRecommended]);

  // Cart logic
  const handleAddToCart = async () => {
    if (!userId) return toast.warn("Bạn cần đăng nhập để thêm vào giỏ hàng!");
    setAddingCart(true);
    try {
      const cartsRes = await getAllCarts();
      let cart = cartsRes.data.find(c => c.userId === userId);
      if (!cart) {
        const newCartRes = await createCart(userId);
        cart = newCartRes.data;
      }
      const res = await addCart({ cartId: cart.id, productId, quantity });
      if (res.errCode === 0) {
        dispatch(addCartItem({
          id: res.data.id,
          product: {
            id: res.data.product.id,
            name: res.data.product.name,
            price: res.data.product.price,
            discount: res.data.product.discount || 0,
            image: res.data.product.image || [],
          },
          quantity: res.data.quantity,
        }));
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
      }
    } catch (err) {
      toast.error("Lỗi khi thêm vào giỏ hàng!");
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
    recommendedPage,
    recommendedTotalPages,
    selectedVariantId,
    setSelectedVariantId,
    quantity,
    setQuantity,
    addingCart,
    fetchReviews,
    fetchRecommended,
    handleAddToCart,
    userId,
    user
  };
};
