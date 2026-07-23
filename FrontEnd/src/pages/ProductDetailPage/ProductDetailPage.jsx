import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductDetail } from "../../hooks/useProductDetail";
import { useProductVariants } from "../../hooks/useProductVariants";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "framer-motion";
import UnifiedSpinner from "../../components/Loading/UnifiedSpinner";
import {
  FiZap,
  FiInfo,
  FiCpu,
  FiMonitor,
  FiBattery,
  FiSmartphone,
  FiMaximize,
  FiMoreHorizontal,
  FiSettings,
  FiChevronRight,
  FiShoppingCart,
} from "react-icons/fi";
import {
  addToWishlistApi,
  removeFromWishlistApi,
  checkWishlistStatusApi,
} from "../../api/wishlistApi";
import ReviewComponent from "../../components/ReviewComponent/ReviewComponent";
import PricePredictionModal from "../../components/PricePredictionModal/PricePredictionModal";

// Sub-components
import ImageGallery from "./components/ImageGallery";
import ProductInfo from "./components/ProductInfo";
import SpecificationSection from "./components/SpecificationSection";
import SmartRecommendations from "./components/SmartRecommendations";

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

  const {
    allAttributes,
    selectedAttributes,
    selectedVariant,
    displayVariant,
    onSelectAttribute,
    checkAttributeAvailability,
  } = useProductVariants(product);

  const [mainImage, setMainImage] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Specifications logic - Normalized and Merged
  const mergedSpecs = useMemo(() => {
    if (!product) return [];
    const specsMap = new Map();

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

    let legacySpecs =
      displayVariant?.specifications || product.specifications || {};
    if (typeof legacySpecs === "string") {
      try {
        legacySpecs = JSON.parse(legacySpecs);
      } catch {
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
          if (res.errCode === 0) setIsWishlisted(res.isInWishlist);
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

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] space-y-4">
        <UnifiedSpinner size="lg" variant="primary" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Đang tải sản phẩm...</p>
      </div>
    );

  if (!product)
    return (
      <div className="text-center mt-20 text-gray-500 dark:text-dark-text-secondary font-medium p-8 border border-gray-100 dark:border-dark-border rounded-2xl bg-gray-50 dark:bg-dark-surface max-w-md mx-auto shadow-sm">
        <FiInfo className="mx-auto text-4xl mb-4 text-gray-300 dark:text-gray-600" />
        <p>Sản phẩm không tồn tại hoặc đã bị ẩn!</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 text-primary dark:text-primary-light hover:underline font-bold cursor-pointer"
        >
          Quay lại trang chủ
        </button>
      </div>
    );

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
    } catch {
      toast.error("Không thể cập nhật danh sách yêu thích");
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) return toast.warn("Vui lòng đăng nhập để mua hàng!");
    if (product?.variants?.length > 0 && !selectedVariant) {
      toast.error("Vui lòng chọn loại sản phẩm (Màu sắc, kích thước...)");
      return;
    }
    const itemId = product?.variants?.length > 0 ? selectedVariant?.id : null;
    const addedItem = await handleAddToCart(itemId, 1);
    if (addedItem)
      navigate("/checkout", { state: { selectedItems: [addedItem] } });
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

  const isFlashSale = product.flashSale?.isActive && timeLeft > 0;
  const originalPrice = displayVariant
    ? displayVariant.price
    : product.basePrice || product.price;

  let currentPrice = originalPrice;
  let discountPercent = 0;

  if (isFlashSale) {
    currentPrice = product.flashSale.price;
    discountPercent = Math.round(
      ((originalPrice - currentPrice) / originalPrice) * 100,
    );
  } else {
    // If there is a variant specific salePrice that is > 0, use it
    if (displayVariant && Number(displayVariant.salePrice) > 0) {
      currentPrice = displayVariant.salePrice;
      discountPercent = Math.round(
        ((originalPrice - currentPrice) / originalPrice) * 100,
      );
    } else {
      // Apply global product discount if any
      discountPercent = Number(
        displayVariant?.discount || product.discount || 0,
      );
      if (discountPercent > 0) {
        currentPrice = originalPrice * (1 - discountPercent / 100);
      }
    }
  }

  return (
    <div className="container-custom py-6 md:py-10 min-h-screen">
      <nav className="flex items-center space-x-2 text-xs text-gray-400 dark:text-dark-text-secondary mb-6 pb-2 border-b border-gray-50 dark:border-dark-border">
        <a
          href="/"
          className="hover:text-primary transition-colors"
        >
          Trang chủ
        </a>
        <FiChevronRight className="size-3" />
        <a
          href="/products"
          className="hover:text-primary transition-colors"
        >
          Sản phẩm
        </a>
        <FiChevronRight className="size-3" />
        <span className="text-gray-700 dark:text-white font-medium truncate max-w-[200px] md:max-w-none">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <ImageGallery
          mainImage={mainImage}
          setMainImage={setMainImage}
          displayImages={displayImages}
          discountPercent={discountPercent}
          productName={product.name}
        />

        <ProductInfo
          product={product}
          isFlashSale={isFlashSale}
          timeLeft={timeLeft}
          currentPrice={currentPrice}
          originalPrice={originalPrice}
          discountPercent={discountPercent}
          ratingStars={ratingStars}
          averageRating={averageRating}
          allAttributes={allAttributes}
          selectedAttributes={selectedAttributes}
          onSelectAttribute={onSelectAttribute}
          checkAttributeAvailability={checkAttributeAvailability}
          onAddToCart={onAddToCart}
          handleBuyNow={handleBuyNow}
          handleWishlist={handleWishlist}
          isWishlisted={isWishlisted}
          loadingWishlist={loadingWishlist}
          setShowPrediction={setShowPrediction}
          selectedVariant={selectedVariant}
          addingCart={addingCart}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-10">
        <div className="lg:col-span-5 hidden lg:block"></div>
        <div className="lg:col-span-7">
          <SpecificationSection
            mergedSpecs={mergedSpecs}
            displayVariant={displayVariant}
          />
        </div>
      </div>

      <SmartRecommendations smartRecs={smartRecs} />

      <div className="mt-16 space-y-12">
        <ReviewComponent reviews={reviews} user={user} />
      </div>

      <PricePredictionModal
        productId={product?.id}
        isOpen={showPrediction}
        onClose={() => setShowPrediction(false)}
      />

      {/* Sticky Bottom Add to Cart Bar */}
      <AnimatePresence>
        {showStickyBar && (
          <Motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 shadow-2xl py-3 px-4"
          >
            <div className="container-custom flex items-center justify-between gap-4">
              {/* Product Short Info */}
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={mainImage || product?.thumbnail || "/images/placeholder.png"}
                  alt={product?.name}
                  className="w-11 h-11 object-cover rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                />
                <div className="min-w-0 hidden sm:block">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {product?.name}
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-extrabold text-rose-600 dark:text-rose-500">
                      {Number(currentPrice).toLocaleString("vi-VN")}₫
                    </span>
                    {discountPercent > 0 && (
                      <span className="text-[10px] text-slate-400 line-through">
                        {Number(originalPrice).toLocaleString("vi-VN")}₫
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onAddToCart}
                  disabled={addingCart}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/20 hover:bg-primary hover:text-white rounded-xl transition border border-primary/20"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  <span>{addingCart ? "Đang thêm..." : "Thêm vào giỏ"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 rounded-xl shadow-md transition"
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;
