import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductDetail } from "../../hooks/useProductDetail";
import { useProductVariants } from "../../hooks/useProductVariants";
import { toast } from "react-toastify";
import {
  FiZap,
  FiClock,
  FiShield,
  FiTruck,
  FiChevronRight,
  FiHeart,
  FiShoppingCart,
  FiCreditCard,
  FiCheck,
  FiInfo,
  FiCpu,
  FiMonitor,
  FiBattery,
  FiSmartphone,
  FiMaximize,
  FiMoreHorizontal,
  FiSettings,
  FiTrendingUp,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import {
  addToWishlistApi,
  removeFromWishlistApi,
  checkWishlistStatusApi,
} from "../../api/wishlistApi";
import ReviewComponent from "../../components/ReviewComponent/ReviewComponent";
import PricePredictionModal from "../../components/PricePredictionModal/PricePredictionModal";

const specIconMap = {
  screen: <FiMonitor />,
  cpu: <FiCpu />,
  ram: <FiSmartphone />,
  rom: <FiMaximize />,
  battery: <FiBattery />,
  os: <FiInfo />,
  refresh_rate: <FiZap />,
  connectivity: <FiMoreHorizontal />,
};

const specLabelMap = {
  screen: "Màn hình",
  cpu: "Vi xử lý (CPU)",
  ram: "Bộ nhớ RAM",
  rom: "Bộ nhớ trong",
  battery: "Dung lượng Pin",
  os: "Hệ điều hành",
  refresh_rate: "Tần số quét",
  connectivity: "Kết nối",
};

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const {
    product,
    loading,
    reviews,
    smartRecs,
    handleAddToCart,
    handleReviewSubmit,
    submittingReview,
    addingCart,
    user,
  } = useProductDetail(slug);

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 5.0;
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const ratingStars = useMemo(() => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    for (let i = 0; i < 5; i++) {
      stars.push(i < fullStars ? "★" : "☆");
    }
    return stars.join("");
  }, [averageRating]);

  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
    images: [],
  });

  const {
    allAttributes,
    selectedAttributes,
    selectedVariant: hookVariant,
    displayVariant,
    onSelectAttribute,
    checkAttributeAvailability,
  } = useProductVariants(product);

  const selectedVariant = useMemo(() => {
    if (hookVariant) return hookVariant;
    if (product?.variants?.length > 0) return null;
    return null;
  }, [hookVariant, product]);

  const [mainImage, setMainImage] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);

  // Specifications logic - Normalized and Merged
  const mergedSpecs = useMemo(() => {
    if (!product) return [];

    const specsMap = new Map();

    // 1. Lấy từ hệ thống Attributes mới của sản phẩm cha
    if (Array.isArray(product.attributes)) {
      product.attributes.forEach((a) => {
        if (a.attribute) {
          specsMap.set(a.attribute.code.toLowerCase(), {
            name: a.attribute.name,
            value: a.value,
            icon: specIconMap[a.attribute.code.toLowerCase()] || <FiSettings />,
          });
        }
      });
    }

    // 2. Lấy từ hệ thống Attributes mới của biến thể đang chọn (Ghi đè)
    if (displayVariant && Array.isArray(displayVariant.attributes)) {
      displayVariant.attributes.forEach((a) => {
        if (a.attribute) {
          specsMap.set(a.attribute.code.toLowerCase(), {
            name: a.attribute.name,
            value: a.value,
            icon: specIconMap[a.attribute.code.toLowerCase()] || <FiSettings />,
          });
        }
      });
    }

    // 3. Lấy từ trường specifications (JSON legacy) - Nếu chưa có trong Map thì mới thêm vào
    let legacySpecs =
      displayVariant?.specifications || product.specifications || {};

    // Nếu legacySpecs là chuỗi JSON, hãy parse nó
    if (typeof legacySpecs === "string") {
      try {
        legacySpecs = JSON.parse(legacySpecs);
      } catch (e) {
        console.error("Error parsing legacy specs:", e);
        legacySpecs = {};
      }
    }

    if (typeof legacySpecs === "object" && legacySpecs !== null) {
      Object.entries(legacySpecs).forEach(([key, value]) => {
        if (!value) return;
        const normalizedKey = key.toLowerCase();
        if (!specsMap.has(normalizedKey)) {
          specsMap.set(normalizedKey, {
            name: specLabelMap[normalizedKey] || key,
            value: value,
            icon: specIconMap[normalizedKey] || <FiInfo />,
          });
        }
      });
    }

    return Array.from(specsMap.values());
  }, [product, displayVariant]);

  useEffect(() => {
    if (product?.images?.length > 0) {
      const primary =
        product.images.find((img) => img.isPrimary) || product.images[0];
      setMainImage(primary.imageUrl);
    }
  }, [product]);

  useEffect(() => {
    if (user && product?.id) {
      const checkWishlistStatus = async () => {
        try {
          const res = await checkWishlistStatusApi(product.id);
          if (res.errCode === 0) {
            setIsWishlisted(res.isInWishlist);
          }
        } catch (error) {
          console.error("Check wishlist error:", error);
        }
      };
      checkWishlistStatus();
    }
  }, [user, product?.id]);

  useEffect(() => {
    if (product?.flashSale?.isActive && product?.flashSale?.endDate) {
      const calculateTimeLeft = () => {
        const diff = new Date(product.flashSale.endDate) - new Date();
        return diff > 0 ? Math.floor(diff / 1000) : 0;
      };
      setTimeLeft(calculateTimeLeft());
      const timer = setInterval(() => {
        const remaining = calculateTimeLeft();
        setTimeLeft(remaining);
        if (remaining <= 0) clearInterval(timer);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [product]);

  useEffect(() => {
    if (displayVariant) {
      const variantImg = product?.images?.find(
        (img) => img.variantId === displayVariant.id,
      );
      if (variantImg) setMainImage(variantImg.imageUrl);
      else if (displayVariant.imageUrl) setMainImage(displayVariant.imageUrl);
    }
  }, [displayVariant, product]);

  const displayImages = useMemo(() => {
    if (!product?.images) return [];
    if (!selectedVariant) return product.images;
    const variantImages = product.images.filter(
      (img) => img.variantId === selectedVariant.id,
    );
    return variantImages.length > 0 ? variantImages : product.images;
  }, [product, selectedVariant]);

  // Early returns MUST be after all Hook calls
  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Đang tải sản phẩm...</p>
      </div>
    );

  if (!product)
    return (
      <div className="text-center mt-20 text-gray-500 font-medium p-8 border border-gray-100 rounded-2xl bg-gray-50 max-w-md mx-auto shadow-sm">
        <FiInfo className="mx-auto text-4xl mb-4 text-gray-300" />
        <p>Sản phẩm không tồn tại hoặc đã bị ẩn!</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 text-blue-600 hover:underline font-bold"
        >
          Quay lại trang chủ
        </button>
      </div>
    );

  const onReviewSubmit = async () => {
    const success = await handleReviewSubmit(newReview);
    if (success) {
      setNewReview({ rating: 0, comment: "", images: [] });
    }
  };

  const handleWishlist = async () => {
    if (!user) return toast.warn("Vui lòng đăng nhập để lưu sản phẩm!");
    setLoadingWishlist(true);
    try {
      if (isWishlisted) {
        await removeFromWishlistApi(product.id);
        setIsWishlisted(false);
        toast.info("Đã xóa khỏi danh sách yêu thích");
      } else {
        await addToWishlistApi(product.id);
        setIsWishlisted(true);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      toast.error("Không thể cập nhật danh sách yêu thích");
    } finally {
      setLoadingWishlist(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      h: String(h).padStart(2, "0"),
      m: String(m).padStart(2, "0"),
      s: String(s).padStart(2, "0"),
    };
  };

  const handleBuyNow = async () => {
    if (!user) return toast.warn("Vui lòng đăng nhập để mua hàng!");
    if (product?.variants?.length > 0 && !selectedVariant) {
      toast.error("Vui lòng chọn loại sản phẩm (Màu sắc, kích thước...)");
      return;
    }

    const itemId = product?.variants?.length > 0 ? selectedVariant?.id : null;
    const addedItem = await handleAddToCart(itemId, 1);

    if (addedItem) {
      navigate("/checkout", {
        state: {
          selectedItems: [addedItem],
        },
      });
    }
  };

  const onAddToCart = (e) => {
    e.preventDefault();
    if (product?.variants?.length > 0 && !selectedVariant) {
      toast.error("Vui lòng chọn loại sản phẩm (Màu sắc, kích thước...)");
      return;
    }
    const itemId = product?.variants?.length > 0 ? selectedVariant?.id : null;
    handleAddToCart(itemId);
  };

  const { h, m, s } = formatTime(timeLeft);
  const isFlashSale = product.flashSale?.isActive && timeLeft > 0;

  const getDisplayPrice = (variant) => {
    if (!variant) return product.basePrice || product.price;
    return Number(variant.salePrice) > 0 ? variant.salePrice : variant.price;
  };

  const currentPrice = isFlashSale
    ? product.flashSale.price
    : getDisplayPrice(displayVariant);
  const originalPrice = displayVariant
    ? displayVariant.price
    : product.basePrice || product.price;
  const discountPercent = isFlashSale
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : displayVariant?.discount || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 bg-white min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-gray-400 mb-6 pb-2 border-b border-gray-50">
        <a href="/" className="hover:text-blue-600 transition-colors">
          Trang chủ
        </a>
        <FiChevronRight className="w-3 h-3" />
        <a href="/products" className="hover:text-blue-600 transition-colors">
          Sản phẩm
        </a>
        <FiChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium truncate max-w-[200px] md:max-w-none">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT: Image Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center relative group">
            <img
              src={mainImage || "/images/no-image.png"}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 p-4"
            />
            {discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-lg shadow-sm">
                -{discountPercent}%
              </div>
            )}
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(img.imageUrl)}
                className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${
                  mainImage === img.imageUrl
                    ? "border-blue-500 scale-95 shadow-sm"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div className="space-y-3">
            <div className="flex items-center flex-wrap gap-2">
              {product.brand && (
                <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  {product.brand.name}
                </span>
              )}
              {isFlashSale && (
                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <FiZap className="fill-current w-3 h-3" /> FLASH SALE
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight tracking-tight">
              {product.name}
            </h1>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-500">
                Đã bán:{" "}
                <span className="text-gray-900 font-semibold">
                  {product.sold}
                </span>
              </span>
              <span className="text-gray-200">|</span>
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-400 tracking-tighter">
                  {ratingStars}
                </div>
                <span className="text-gray-900 font-bold">{averageRating}</span>
              </div>
            </div>
          </div>

          {/* Flash Sale Countdown */}
          {isFlashSale && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm uppercase">
                <FiClock className="text-lg" /> Kết thúc sau:
              </div>
              <div className="flex gap-1.5 font-bold text-sm">
                <span className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center">
                  {h}
                </span>
                <span className="flex items-center">:</span>
                <span className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center">
                  {m}
                </span>
                <span className="flex items-center">:</span>
                <span className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center">
                  {s}
                </span>
              </div>
            </div>
          )}

          {/* Price Section */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-red-600">
                {Number(currentPrice).toLocaleString("vi-VN")}₫
              </span>
              {(isFlashSale || discountPercent > 0) && (
                <span className="text-sm font-medium text-gray-400 line-through">
                  {Number(originalPrice).toLocaleString("vi-VN")}₫
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                  TIẾT KIỆM {discountPercent}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <div
                className={`w-2 h-2 rounded-full ${(product.totalStock || product.stock) > 0 ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-tight">
                {(product.totalStock || product.stock) > 0
                  ? `Còn ${product.totalStock || product.stock} sản phẩm`
                  : "Hết hàng tạm thời"}
              </p>
            </div>
          </div>

          {/* Variants Selection */}
          {Object.keys(allAttributes).length > 0 && (
            <div className="space-y-5 py-4 border-y border-gray-50">
              {Object.entries(allAttributes).map(([attrName, values]) => (
                <div key={attrName} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                      Chọn {attrName}
                    </label>
                    {selectedAttributes[attrName] && (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        Đã chọn: {selectedAttributes[attrName]}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {values.map((val) => {
                      const isSelected = selectedAttributes[attrName] === val;
                      const isAvailable = checkAttributeAvailability(
                        attrName,
                        val,
                      );
                      return (
                        <button
                          key={val}
                          disabled={!isAvailable}
                          onClick={() => onSelectAttribute(attrName, val)}
                          className={`min-w-[60px] px-4 py-2 rounded-lg text-xs font-bold transition-all border-2 flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                              : isAvailable
                                ? "bg-white border-gray-200 hover:border-blue-300 hover:text-blue-600 text-gray-700"
                                : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed opacity-60"
                          }`}
                        >
                          {val}
                          {isSelected && <FiCheck className="w-3 h-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex gap-3">
              <button
                onClick={onAddToCart}
                disabled={
                  addingCart ||
                  (!selectedVariant && product.variants?.length > 0)
                }
                className={`flex-1 h-12 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-2 ${
                  !selectedVariant && product.variants?.length > 0
                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                    : "bg-white border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <FiShoppingCart className="text-lg" />
                <span className="hidden sm:inline">THÊM GIỎ HÀNG</span>
                <span className="sm:hidden">THÊM GIỎ</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={
                  addingCart ||
                  (!selectedVariant && product.variants?.length > 0)
                }
                className={`flex-[1.5] h-12 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
                  !selectedVariant && product.variants?.length > 0
                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-100"
                }`}
              >
                <FiCreditCard className="text-lg" />
                MUA NGAY
              </button>

              <button
                onClick={handleWishlist}
                disabled={loadingWishlist}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all shadow-sm ${
                  isWishlisted
                    ? "border-red-100 bg-red-50 text-red-500"
                    : "border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-red-500 hover:border-red-100"
                }`}
              >
                {isWishlisted ? (
                  <FaHeart className="text-xl" />
                ) : (
                  <FiHeart className="text-xl" />
                )}
              </button>
            </div>

            {/* AI Prediction Button */}
            <button
              onClick={() => setShowPrediction(true)}
              className="w-full h-12 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <FiTrendingUp className="text-lg text-indigo-600" />
              DỰ ĐOÁN GIÁ AI
            </button>

            {!selectedVariant && product.variants?.length > 0 && (
              <p className="text-center text-red-500 text-[10px] font-bold uppercase tracking-wider bg-red-50 py-2 rounded-lg">
                ⚠️ Vui lòng chọn phiên bản để tiếp tục mua hàng
              </p>
            )}
          </div>

          {/* Policy Section */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FiShield size={18} />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">
                  Bảo hành
                </span>
                <span className="block text-[11px] font-bold text-gray-700 truncate">
                  12 THÁNG CHÍNH HÃNG
                </span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <FiTruck size={18} />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">
                  Vận chuyển
                </span>
                <span className="block text-[11px] font-bold text-gray-700 truncate">
                  MIỄN PHÍ TOÀN QUỐC
                </span>
              </div>
            </div>
          </div>

          {/* Specifications - Dynamically showing based on variant */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                <span className="w-6 h-[1.5px] bg-blue-500"></span>
                Thông số kỹ thuật
              </h3>
              {displayVariant && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                  Cấu hình riêng {displayVariant.sku?.split("-")[0]}
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/30 shadow-sm transition-all duration-500">
              {mergedSpecs.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {mergedSpecs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-3.5 px-5 text-xs transition-colors hover:bg-white bg-white/40"
                    >
                      <span className="text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-white shadow-sm text-blue-500">
                          {spec.icon}
                        </span>
                        {spec.name}
                      </span>
                      <span className="text-gray-900 font-extrabold">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-200 shadow-inner">
                    <FiCpu size={32} />
                  </div>
                  <p className="text-xs text-gray-400 font-medium italic max-w-[200px] leading-relaxed">
                    {displayVariant
                      ? "Phiên bản này đang được cập nhật thông số..."
                      : "Vui lòng chọn phiên bản để xem cấu hình chi tiết."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Recommendations Section */}
      {smartRecs.length > 0 && (
        <div className="mt-20 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <FiZap className="fill-current" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  Gợi ý thông minh
                </h2>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Dựa trên phân tích AI & Hành vi mua sắm của bạn
              </p>
            </div>
            <a
              href="/products"
              className="text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-2 group"
            >
              Xem tất cả sản phẩm{" "}
              <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {smartRecs.map((rec) => (
              <a
                key={rec.id}
                href={`/product/${rec.id}`}
                className="group bg-white rounded-3xl border border-gray-100 p-4 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm flex items-center gap-1 ${
                      rec.reason === "Thường mua cùng"
                        ? "bg-emerald-500 text-white"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {rec.reason === "Thường mua cùng" ? "🤝" : "✨"}{" "}
                    {rec.reason}
                  </span>
                </div>

                <div className="aspect-square rounded-2xl bg-gray-50 mb-4 overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={rec.image}
                    alt={rec.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-slate-900 uppercase truncate group-hover:text-indigo-600 transition-colors">
                    {rec.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-black text-red-600">
                      {Number(
                        rec.basePrice * (1 - (rec.discount || 0) / 100),
                      ).toLocaleString()}
                      đ
                    </span>
                    {rec.discount > 0 && (
                      <span className="text-[10px] font-bold text-slate-400 line-through">
                        {rec.basePrice.toLocaleString()}đ
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Review Section */}
      <div className="mt-16 space-y-12">
        <ReviewComponent reviews={reviews} user={user} />
      </div>

      <PricePredictionModal
        productId={product?.id}
        isOpen={showPrediction}
        onClose={() => setShowPrediction(false)}
      />
    </div>
  );
};

export default ProductDetailPage;
