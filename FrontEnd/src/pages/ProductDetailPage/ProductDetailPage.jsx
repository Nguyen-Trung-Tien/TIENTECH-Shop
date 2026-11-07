import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProductDetail } from "../../hooks/useProductDetail";
import { useProductVariants } from "../../hooks/useProductVariants";
import { toast } from "react-toastify";
import { motion as Motion, AnimatePresence } from "framer-motion";
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
  FiShield,
  FiGift,
  FiPhoneCall,
  FiCheckCircle,
} from "react-icons/fi";
import {
  addToWishlistApi,
  removeFromWishlistApi,
  checkWishlistStatusApi,
} from "../../api/wishlistApi";
import ReviewComponent from "../../components/ReviewComponent/ReviewComponent";

const PricePredictionModal = React.lazy(
  () => import("../../components/PricePredictionModal/PricePredictionModal")
);

// Sub-components
import ImageGallery from "./components/ImageGallery";
import ProductInfo from "./components/ProductInfo";
import ProductDescriptionTabs from "./components/ProductDescriptionTabs";
import SmartRecommendations from "./components/SmartRecommendations";
import ProductDetailSkeleton from "./components/ProductDetailSkeleton";

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
    reviewsSummary,
    reviewPage,
    ratingFilter,
    hasImageFilter,
    pagination,
    changeReviewPage,
    changeReviewFilter,
    smartRecs,
    handleAddToCart,
    addingCart,
    user,
    handleReviewSubmit,
    submittingReview,
  } = useProductDetail(slug);

  const averageRating = useMemo(() => {
    if (
      reviewsSummary?.averageRating !== undefined &&
      reviewsSummary?.averageRating !== null
    ) {
      return Number(reviewsSummary.averageRating).toFixed(1);
    }
    return "5.0";
  }, [reviewsSummary]);

  const ratingStars = useMemo(() => {
    const stars = [];
    const fullStars = Math.floor(Number(averageRating));
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

    const parseSpecsObj = (raw) => {
      if (!raw) return {};
      if (typeof raw === "string") {
        try {
          return JSON.parse(raw);
        } catch {
          return {};
        }
      }
      return typeof raw === "object" ? raw : {};
    };

    // 1. Relational Product Attributes
    if (Array.isArray(product.attributes)) {
      product.attributes.forEach((a) => {
        if (a.attribute && a.value) {
          const code = (a.attribute.code || "").toLowerCase();
          specsMap.set(code, {
            name: a.attribute.name || specLabelMap[code] || code,
            value: String(a.value).trim(),
            icon: specIconMap[code] || <FiSettings />,
          });
        }
      });
    }

    // 2. Product Specifications (JSON field)
    const mainSpecsObj = parseSpecsObj(product.specifications);
    Object.entries(mainSpecsObj).forEach(([key, value]) => {
      if (!value || String(value).trim() === "") return;
      const normalizedKey = key.toLowerCase();
      const existing = specsMap.get(normalizedKey);
      if (!existing) {
        specsMap.set(normalizedKey, {
          name: specLabelMap[normalizedKey] || key,
          value: String(value).trim(),
          icon: specIconMap[normalizedKey] || <FiInfo />,
        });
      } else {
        specsMap.set(normalizedKey, {
          ...existing,
          value: String(value).trim(),
        });
      }
    });

    // 3. Relational Display Variant Attributes
    if (displayVariant && Array.isArray(displayVariant.attributes)) {
      displayVariant.attributes.forEach((a) => {
        if (a.attribute && a.value) {
          const code = (a.attribute.code || "").toLowerCase();
          specsMap.set(code, {
            name: a.attribute.name || specLabelMap[code] || code,
            value: String(a.value).trim(),
            icon: specIconMap[code] || <FiSettings />,
          });
        }
      });
    }

    // 4. Display Variant Specifications
    if (displayVariant) {
      const variantSpecsObj = parseSpecsObj(displayVariant.specifications);
      Object.entries(variantSpecsObj).forEach(([key, value]) => {
        if (!value || String(value).trim() === "") return;
        const normalizedKey = key.toLowerCase();
        specsMap.set(normalizedKey, {
          name: specLabelMap[normalizedKey] || key,
          value: String(value).trim(),
          icon: specIconMap[normalizedKey] || <FiInfo />,
        });
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
    const flashSaleActive = product?.flashSale?.isActive ?? product?.flashSaleActive;
    const flashSaleEndDate = product?.flashSale?.endDate ?? product?.flashSaleEnd;

    if (flashSaleActive && flashSaleEndDate) {
      const calculateTimeLeft = () => {
        const diff = new Date(flashSaleEndDate) - new Date();
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

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product)
    return (
      <div className="text-center mt-20 text-slate-500 dark:text-dark-text-secondary font-medium p-8 border border-slate-100 dark:border-dark-border rounded-3xl bg-slate-50 dark:bg-dark-surface max-w-md mx-auto shadow-sm">
        <FiInfo className="mx-auto text-4xl mb-4 text-slate-300 dark:text-slate-600" />
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
    const addedItem = await handleAddToCart(itemId, 1, false);
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

  const isFlashSale = Boolean(
    (product?.flashSale?.isActive ?? product?.flashSaleActive) && timeLeft > 0,
  );
  const flashSalePrice = Number(
    product?.flashSale?.price ?? product?.flashSalePrice ?? 0,
  );
  const originalPrice = Number(
    displayVariant
      ? displayVariant.price
      : product?.originalPrice || product?.basePrice || product?.price || 0,
  );

  let currentPrice = originalPrice;
  let discountPercent = 0;

  if (isFlashSale && flashSalePrice > 0) {
    currentPrice = flashSalePrice;
    discountPercent = Math.round(
      ((originalPrice - currentPrice) / originalPrice) * 100,
    );
  } else {
    const variantDisc =
      displayVariant?.discount != null && Number(displayVariant.discount) > 0
        ? Number(displayVariant.discount)
        : 0;

    if (
      displayVariant &&
      Number(displayVariant.salePrice) > 0 &&
      Number(displayVariant.salePrice) < originalPrice
    ) {
      currentPrice = Number(displayVariant.salePrice);
      discountPercent = Math.round(
        ((originalPrice - currentPrice) / originalPrice) * 100,
      );
    } else if (variantDisc > 0) {
      discountPercent = variantDisc;
      currentPrice = Math.round(originalPrice * (1 - discountPercent / 100));
    } else {
      discountPercent = Number(
        product?.discountPercent ||
          product?.discount ||
          0,
      );
      if (discountPercent > 0 && originalPrice > 0) {
        currentPrice = Math.round(originalPrice * (1 - discountPercent / 100));
      }
    }
  }

  return (
    <div className="container-custom py-6 md:py-10 min-h-screen">
      {/* Editorial Breadcrumb with Auspicious Status */}
      <nav className="flex items-center justify-between text-xs text-slate-400 dark:text-dark-text-secondary mb-6 pb-3 border-b border-slate-100 dark:border-dark-border">
        <div className="flex items-center space-x-2 truncate min-w-0">
          <a
            href="/"
            className="hover:text-primary transition-colors shrink-0"
          >
            Trang chủ
          </a>
          <FiChevronRight className="size-3 shrink-0" />
          <a
            href="/products"
            className="hover:text-primary transition-colors shrink-0"
          >
            Sản phẩm
          </a>
          <FiChevronRight className="size-3 shrink-0" />
          <span className="text-slate-800 dark:text-white font-semibold truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-900/50 font-bold">
          <FiZap className="size-3 fill-current" /> Tụ Khí Sinh Tài
        </div>
      </nav>

      {/* Tier 1: Hero Showcase & Buy Center (Golden Ratio 5 : 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
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

      {/* Tier 2: Interactive Content Tabs & Trust Sidebar (8 : 4 Grid Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 mt-12 items-start">
        {/* Main Content Sanctuary (8 cols) */}
        <div className="lg:col-span-8 min-w-0">
          <ProductDescriptionTabs
            product={product}
            mergedSpecs={mergedSpecs}
            displayVariant={displayVariant}
          />
        </div>

        {/* Wealth & Trust Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Privilege & Auspicious Gift Box */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-primary/5 dark:from-dark-card dark:to-dark-surface border border-amber-200/80 dark:border-dark-border shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">
              <FiGift className="size-4" /> Đặc Quyền Khai Vận TIENTECH
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <FiCheckCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Tặng gói vệ sinh & thanh tẩy năng lượng thiết bị miễn phí 1 năm</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Giảm ngay 20% khi mua kèm phụ kiện hợp mệnh phong thuỷ</span>
              </li>
              <li className="flex items-start gap-2">
                <FiCheckCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Giao hàng phong ấn bảo mật, đóng thùng chống sốc 3 lớp</span>
              </li>
            </ul>
          </div>

          {/* Diamond Warranty Assurance */}
          <div className="p-5 rounded-3xl bg-white dark:bg-dark-surface border border-slate-200/80 dark:border-dark-border shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              <FiShield className="text-primary size-4" /> Bảo Chứng Kim Cương
            </div>
            <p className="text-xs text-slate-500 dark:text-dark-text-secondary leading-relaxed">
              Mọi sản phẩm bán ra tại TIENTECH đều được cấp mã bảo hành điện tử chính hãng, bảo vệ quyền lợi trọn vẹn cho khách hàng.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-dark-border flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Đổi trả 30 ngày</span>
              <span className="text-emerald-600 dark:text-emerald-400">Không lý do</span>
            </div>
          </div>

          {/* Hotline & Dedicated Support */}
          <div className="p-4.5 rounded-3xl bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm shadow-primary/25">
                <FiPhoneCall size={18} />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-dark-text-secondary uppercase">
                  Chuyên viên hỗ trợ 24/7
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  1800 6868 (Miễn cước)
                </div>
              </div>
            </div>
            <a
              href="tel:18006868"
              className="px-3 py-1.5 text-xs font-bold text-primary dark:text-primary-light bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl hover:shadow-xs transition"
            >
              Gọi ngay
            </a>
          </div>
        </div>
      </div>

      {/* Tier 3: AI Recommendations Ecosystem */}
      <SmartRecommendations smartRecs={smartRecs} />

      {/* Customer Reviews Section */}
      <div id="reviews-section" className="mt-16 space-y-12">
        <ReviewComponent
          reviews={reviews}
          reviewsSummary={reviewsSummary}
          user={user}
          pagination={pagination}
          reviewPage={reviewPage}
          ratingFilter={ratingFilter}
          hasImageFilter={hasImageFilter}
          onPageChange={changeReviewPage}
          onFilterChange={changeReviewFilter}
          onSubmitReview={handleReviewSubmit}
          submittingReview={submittingReview}
        />
      </div>

      {/* AI Price Prediction Modal */}
      {showPrediction && (
        <React.Suspense fallback={null}>
          <PricePredictionModal
            productId={product?.id}
            isOpen={showPrediction}
            onClose={() => setShowPrediction(false)}
          />
        </React.Suspense>
      )}

      {/* Floating Sticky Buy Bar (Tụ Tài Chốt Đơn) */}
      <AnimatePresence>
        {showStickyBar && (
          <Motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white/92 dark:bg-dark-surface/92 backdrop-blur-xl border-t border-slate-200/80 dark:border-dark-border shadow-2xl py-3 px-4"
          >
            <div className="container-custom flex items-center justify-between gap-4">
              {/* Product Short Info */}
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={mainImage || product?.thumbnail || "/images/placeholder.png"}
                  alt={product?.name}
                  className="size-11 object-cover rounded-xl bg-slate-100 dark:bg-dark-card shrink-0 border border-slate-200/80 dark:border-dark-border"
                />
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {product?.name}
                  </h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-500 truncate">
                      {Number(currentPrice).toLocaleString("vi-VN")}₫
                    </span>
                    {discountPercent > 0 && (
                      <span className="text-[10px] text-slate-400 line-through hidden sm:inline">
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
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 text-xs font-bold text-primary dark:text-primary-light bg-primary/10 hover:bg-primary hover:text-white rounded-xl transition border border-primary/20 cursor-pointer"
                >
                  <FiShoppingCart className="size-4" />
                  <span className="hidden sm:inline">
                    {addingCart ? "Đang thêm..." : "Thêm vào giỏ"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="px-4 sm:px-6 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-primary via-indigo-600 to-primary hover:opacity-95 rounded-xl shadow-md shadow-primary/25 transition cursor-pointer"
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
