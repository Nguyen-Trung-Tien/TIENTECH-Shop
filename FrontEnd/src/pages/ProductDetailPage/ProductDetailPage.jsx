import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiShoppingCart, FiCreditCard, FiStar, FiZap, FiChevronLeft, FiChevronRight, FiPlus, FiMinus, FiBox } from "react-icons/fi";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  getProductByIdApi,
  getRecommendedProductsApi,
} from "../../api/productApi";
import { addCart, getAllCarts, createCart } from "../../api/cartApi";
import { createReviewApi, getReviewsByProductApi } from "../../api/reviewApi";
import ProductCard from "../../components/ProductCard/ProductCard";
import { getImage } from "../../utils/decodeImage";
import { addCartItem } from "../../redux/cartSlice";
import ChatBot from "../../components/ChatBot/ChatBot";
import ReviewForm from "../../components/ReviewComponent/ReviewForm";
import ReviewList from "../../components/ReviewComponent/ReviewList";
import PricePredictionModal from "../../components/PricePredictionModal/PricePredictionModal";
import { predictPrice } from "../../api/chatApi";
import LoadMoreButton from "../../components/LoadMoreButton/LoadMoreButton";
import SkeletonCard from "../../components/SkeletonCard/SkeletonCard";
import Button from "../../components/UI/Button";
import Badge from "../../components/UI/Badge";

const ProductDetailPage = () => {
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingCart, setAddingCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [showFullDesc, setShowFullDesc] = useState(false);
  const limit = 3;

  const [recommended, setRecommended] = useState([]);
  const [recommendedPage, setRecommendedPage] = useState(1);
  const [recommendedTotalPages, setRecommendedTotalPages] = useState(1);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [loadingMoreRecommended, setLoadingMoreRecommended] = useState(false);
  const [predictResult, setPredictResult] = useState(null);
  const [showPredict, setShowPredict] = useState(false);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const limitRecommended = 6;

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    : 0;

  const fetchReviews = useCallback(async (productId, page = 1) => {
    try {
      const res = await getReviewsByProductApi(productId, page, limit);
      if (res?.errCode === 0) {
        setReviews(res.data || []);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("Lỗi tải đánh giá:", err);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProductByIdApi(id);
      if (res?.errCode === 0 && res.product) {
        const p = res.product;
        setProduct(p);
        const primary =
          p.images?.find((i) => i.isPrimary)?.imageUrl ||
          p.image ||
          p.images?.[0]?.imageUrl ||
          null;
        setSelectedImage(primary);
        const initialIndex =
          primary && p.images?.length
            ? p.images.findIndex((i) => i.imageUrl === primary)
            : 0;
        setSelectedIndex(initialIndex >= 0 ? initialIndex : 0);
        if (p.variants && p.variants.length > 0) {
          const firstActive =
            p.variants.find((v) => v.isActive) || p.variants[0];
          setSelectedVariantId(firstActive?.id || null);
          if (firstActive?.imageUrl) setSelectedImage(firstActive.imageUrl);
        } else {
          setSelectedVariantId(null);
        }

        await fetchReviews(p.id); // OK
      } else {
        toast.error("Không tìm thấy sản phẩm!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải sản phẩm!");
    } finally {
      setLoading(false);
    }
  }, [id, fetchReviews]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const fetchRecommended = useCallback(
    async (page = 1, append = false) => {
      if (!product || !product.id) return;

      try {
        if (page === 1) setLoadingRecommended(true);
        else setLoadingMoreRecommended(true);

        const res = await getRecommendedProductsApi(
          product.id,
          page,
          limitRecommended,
        );
        if (res?.errCode === 0) {
          if (append) {
            setRecommended((prev) => [...prev, ...res.data]);
          } else {
            setRecommended(res.data);
          }

          setRecommendedTotalPages(res.pagination?.totalPages || 1);
        }
      } finally {
        setLoadingRecommended(false);
        setLoadingMoreRecommended(false);
      }
    },
    [product],
  );

  const handleLoadMoreRecommended = () => {
    if (recommendedPage < recommendedTotalPages) {
      const nextPage = recommendedPage + 1;
      setRecommendedPage(nextPage);
      fetchRecommended(nextPage, true);
    }
  };

  useEffect(() => {
    if (!product || !product.id) return;

    setRecommended([]);
    setRecommendedPage(1);
    fetchRecommended(1, false);
  }, [product, fetchRecommended]);

  const handleAddToCart = async () => {
    if (!userId) {
      toast.warn("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }
    try {
      setAddingCart(true);
      const cartsRes = await getAllCarts();
      let cart = cartsRes.data.find((c) => c.userId === userId);
      if (!cart) {
        const newCartRes = await createCart(userId);
        cart = newCartRes.data;
      }
      const res = await addCart(
        {
          cartId: cart.id,
          productId: product.id,
          quantity,
        }
      );
      if (res.errCode === 0) {
        dispatch(
          addCartItem({
            id: res.data.id,
            product: {
              id: res.data.product.id,
              name: res.data.product.name,
              price: res.data.product.price,
              discount: res.data.product.discount || 0,
              image: res.data.product.image || [],
            },
            quantity: res.data.quantity,
          }),
        );
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
      } else {
        toast.error(res.errMessage || "Thêm vào giỏ hàng thất bại!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi thêm vào giỏ hàng!");
    } finally {
      setAddingCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!product?.id) return;
    navigate("/checkout", { state: { product, quantity } });
  };

  const handleSubmitReview = async () => {
    if (!userId) {
      toast.warning("Đăng nhập để gửi đánh giá!");
      return;
    }
    if (!newReview.comment.trim()) {
      toast.info("Vui lòng nhập bình luận!");
      return;
    }
    try {
      const payload = { userId, productId: product.id, ...newReview };
      const res = await createReviewApi(payload);
      if (res?.errCode === 0) {
        toast.success("Gửi đánh giá thành công!");
        setNewReview({ rating: 5, comment: "" });
        fetchReviews(product.id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi gửi đánh giá!");
    }
  };

  const handlePricePredict = async () => {
    if (!product?.id) return;

    setLoadingPredict(true);
    try {
      const result = await predictPrice(product.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setPredictResult(result);
      setShowPredict(true);
    } catch (err) {
      console.error(err);
      toast.error("Không thể dự đoán giá!");
    } finally {
      setLoadingPredict(false);
    }
  };

  const formatVND = (val) => {
    if (val == null || val === "") return "0 ₫";
    const number = Number(val);
    if (isNaN(number)) return "0 ₫";
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    });
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface-50 gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-surface-400 font-bold uppercase tracking-widest text-[11px]">Đang tải thông tin sản phẩm...</p>
      </div>
    );

  if (!product)
    return (
      <div className="text-center py-5">
        <h4>Không tìm thấy sản phẩm!</h4>
        <Link to="/" className="btn btn-outline-secondary mt-3">
          <ArrowLeftCircle className="me-2" /> Quay lại
        </Link>
      </div>
    );

  const gallery = (() => {
    const urls = [];
    if (product.images && product.images.length > 0) {
      product.images.forEach((i) => {
        if (i?.imageUrl) urls.push(i.imageUrl);
      });
    }
    if (product.image) urls.push(product.image);
    return Array.from(new Set(urls));
  })();

  const variants = Array.isArray(product.variants) ? product.variants : [];
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) || null;

  const variantAttributes = (() => {
    const map = {};
    variants.forEach((v) => {
      const attrs = v.attributes || {};
      Object.keys(attrs).forEach((key) => {
        if (!map[key]) map[key] = new Set();
        map[key].add(attrs[key]);
      });
    });
    const result = {};
    Object.keys(map).forEach((k) => {
      result[k] = Array.from(map[k]);
    });
    return result;
  })();

  const selectedAttributes = selectedVariant?.attributes || {};

  const applyAttribute = (key, value) => {
    const next = { ...selectedAttributes, [key]: value };
    const found = variants.find((v) => {
      const attrs = v.attributes || {};
      return Object.keys(next).every((k) => attrs[k] === next[k]);
    });
    if (found) {
      setSelectedVariantId(found.id);
      if (found.imageUrl) setSelectedImage(found.imageUrl);
      setQuantity(1);
    } else {
      setSelectedVariantId(null);
    }
  };

  const activePrice =
    selectedVariant?.price != null
      ? Number(selectedVariant.price)
      : product.price;
  const activeStock =
    selectedVariant?.stock != null
      ? Number(selectedVariant.stock)
      : product.stock;

  const discountedPrice = Math.round(
    product.discount > 0
      ? activePrice * (1 - product.discount / 100)
      : activePrice,
  );

  const currentIndex = (() => {
    if (!selectedImage) return 0;
    const idx = gallery.findIndex((u) => u === selectedImage);
    return idx >= 0 ? idx : 0;
  })();

  const goPrev = () => {
    if (gallery.length === 0) return;
    const next = (currentIndex - 1 + gallery.length) % gallery.length;
    setSelectedIndex(next);
    setSelectedImage(gallery[next]);
  };

  const goNext = () => {
    if (gallery.length === 0) return;
    const next = (currentIndex + 1) % gallery.length;
    setSelectedIndex(next);
    setSelectedImage(gallery[next]);
  };

  const shortDescription =
    product.description && product.description.length > 250
      ? product.description.slice(0, 250) + "..."
      : product.description;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <PricePredictionModal
        show={showPredict}
        onHide={() => setShowPredict(false)}
        result={predictResult}
      />
      <ChatBot />

      <div className="container-custom pt-8">
        {/* Breadcrumb / Back */}
        <nav className="flex mb-8 items-center gap-2 text-sm font-medium text-slate-500">
          <Link to="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Image Gallery */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative aspect-square rounded-[40px] bg-white shadow-xl-soft border border-slate-100 overflow-hidden flex items-center justify-center p-8 group">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={getImage(selectedImage || product.image)}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />

              {gallery.length > 1 && (
                <>
                  <button
                    onClick={goPrev}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-90"
                  >
                    <ArrowLeftCircle size={24} />
                  </button>
                  <button
                    onClick={goNext}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-90 rotate-180"
                  >
                    <ArrowLeftCircle size={24} />
                  </button>
                </>
              )}

              {product.discount > 0 && (
                <div className="absolute top-8 left-8">
                  <span className="bg-rose-500 text-white text-sm font-black px-4 py-2 rounded-2xl shadow-lg shadow-rose-500/20">
                    -{product.discount}%
                  </span>
                </div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="flex flex-wrap gap-4 justify-center">
                {gallery.map((url, idx) => (
                  <button
                    key={`${url}-${idx}`}
                    onClick={() => {
                      setSelectedIndex(idx);
                      setSelectedImage(url);
                    }}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-2 bg-white ${
                      (selectedImage || product.image) === url
                        ? "border-primary shadow-lg shadow-primary/10"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getImage(url)}
                      alt=""
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:col-span-6 flex flex-col h-full">
            <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-xl-soft border border-slate-100 flex-1">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                  {product.brand?.name}
                </span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
                  {product.category?.name}
                </span>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <div className="flex text-amber-400 gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const star = i + 1;
                        if (avgRating >= star) return <FaStar key={i} size={14} />;
                        if (avgRating >= star - 0.5) return <FaStarHalfAlt key={i} size={14} />;
                        return <FaRegStar key={i} size={14} className="text-slate-200" />;
                      })}
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      ({reviews.length} đánh giá)
                    </span>
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-8 text-sm font-medium text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="text-slate-300">SKU:</span>{" "}
                  {selectedVariant?.sku || product.sku}
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>Đã bán {product.sold}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span
                  className={`${activeStock > 0 ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {activeStock > 0 ? `Còn hàng (${activeStock})` : "Hết hàng"}
                </span>
              </div>

              {/* Price Card */}
              <div className="bg-slate-50 rounded-3xl p-6 mb-8 border border-slate-100">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-black text-primary">
                    {formatVND(discountedPrice)}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-xl font-medium text-slate-400 line-through">
                      {formatVND(activePrice)}
                    </span>
                  )}
                </div>
                {product.discount > 0 && (
                  <p className="mt-2 text-sm font-bold text-emerald-600 flex items-center gap-1">
                    <FiZap className="fill-current" />
                    Tiết kiệm {formatVND(activePrice - discountedPrice)} (
                    {parseFloat(product.discount).toFixed(2)}%)
                  </p>
                )}
              </div>

              {/* Variants */}
              {Object.keys(variantAttributes).length > 0 && (
                <div className="space-y-6 mb-8">
                  {Object.entries(variantAttributes).map(([key, values]) => (
                    <div key={key}>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        {key}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {values.map((val) => {
                          const active = selectedAttributes?.[key] === val;
                          return (
                            <button
                              key={`${key}-${val}`}
                              onClick={() => applyAttribute(key, val)}
                              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                active
                                  ? "bg-primary text-white shadow-lg shadow-primary/20 ring-2 ring-primary ring-offset-2"
                                  : "bg-white border border-slate-200 text-slate-600 hover:border-primary/40 hover:bg-slate-50"
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Specs Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 pt-8 border-t border-slate-100">
                {product.cpu && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      CPU
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {product.cpu}
                    </p>
                  </div>
                )}
                {product.ram && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      RAM
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {product.ram}
                    </p>
                  </div>
                )}
                {product.rom && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      ROM
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {product.rom}
                    </p>
                  </div>
                )}
                {product.screen && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Màn hình
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {product.screen}
                    </p>
                  </div>
                )}
                {product.battery && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Pin
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {product.battery}
                    </p>
                  </div>
                )}
                {product.os && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      OS
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {product.os}
                    </p>
                  </div>
                )}
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-700">
                    Số lượng:
                  </span>
                  <div className="flex items-center bg-slate-100 rounded-xl p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:text-primary transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={activeStock}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(
                            1,
                            Math.min(Number(e.target.value), activeStock),
                          ),
                        )
                      }
                      className="w-12 text-center bg-transparent border-none text-sm font-bold focus:ring-0"
                    />
                    <button
                      onClick={() =>
                        setQuantity(Math.min(activeStock, quantity + 1))
                      }
                      className="w-8 h-8 flex items-center justify-center font-bold text-slate-600 hover:text-primary transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={
                      addingCart || activeStock < 1 || !product.isActive
                    }
                    className="h-14 rounded-2xl bg-white border-2 border-primary text-primary font-black hover:bg-primary/5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                  >
                    {addingCart ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiShoppingCart size={24} />
                    )}
                    THÊM VÀO GIỎ
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={activeStock < 1 || !product.isActive}
                    className="h-14 rounded-2xl bg-primary text-white font-black hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                  >
                    <FiCreditCard size={24} />
                    MUA NGAY
                  </button>
                </div>

                <button
                  onClick={handlePricePredict}
                  disabled={loadingPredict}
                  className="w-full h-12 rounded-2xl bg-amber-50 text-amber-600 font-bold border border-amber-200 hover:bg-amber-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {loadingPredict ? (
                    <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "🔮 DỰ ĐOÁN GIÁ TƯƠNG LAI BẰNG AI"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sections: Description, Reviews, Recommended */}
        <div className="mt-20 space-y-20">
          {/* Description */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Mô tả sản phẩm
              </h2>
              <div className="h-[2px] flex-1 bg-slate-100"></div>
            </div>
            <div
              className={`prose prose-slate max-w-none text-slate-600 leading-relaxed ${!showFullDesc ? "line-clamp-[10]" : ""}`}
            >
              {product.description}
            </div>
            {product.description?.length > 500 && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="mt-6 text-primary font-bold hover:underline transition-all"
              >
                {showFullDesc ? "Thu gọn nội dung ▲" : "Xem toàn bộ mô tả ▼"}
              </button>
            )}
          </section>

          {/* Reviews */}
          <section className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl-soft border border-slate-100">
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Đánh giá khách hàng
              </h2>
              <div className="h-[2px] flex-1 bg-slate-100"></div>
            </div>
            <ReviewForm
              newReview={newReview}
              setNewReview={setNewReview}
              onSubmit={handleSubmitReview}
            />
            <ReviewList
              reviews={reviews}
              page={page}
              pagination={pagination}
              onPageChange={(newPage) => {
                setPage(newPage);
                fetchReviews(product.id, newPage);
              }}
              user={user}
            />
          </section>

          {/* Recommended */}
          <section>
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                Sản phẩm tương tự
              </h2>
              <div className="h-[2px] flex-1 bg-slate-100"></div>
            </div>

            {loadingRecommended ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : recommended.length > 0 ? (
              <div className="space-y-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {recommended.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                {recommendedPage < recommendedTotalPages && (
                  <div className="flex justify-center">
                    <LoadMoreButton
                      page={recommendedPage}
                      totalPages={recommendedTotalPages}
                      loadingMore={loadingMoreRecommended}
                      onLoadMore={handleLoadMoreRecommended}
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-10">
                Không tìm thấy sản phẩm tương tự.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
