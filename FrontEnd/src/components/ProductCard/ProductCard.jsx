import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { m as Motion } from "framer-motion";
import { addCart } from "../../api/cartApi";
import { getProductByIdApi } from "../../api/productApi";
import { addCartItem, addGuestCartItem } from "../../redux/cartSlice";
import { setBuyNowCheckout } from "../../redux/checkoutSlice";
import { calculateFinalPrice } from "../../utils/priceHelper";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { FaStar, FaHeart } from "react-icons/fa";
import { ArrowLeftRight } from "lucide-react";
import {
  toggleCompareItem,
  selectCompareItems,
  MAX_COMPARE_ITEMS,
} from "../../features/compare/compareSlice";
import { addToWishlistApi, removeFromWishlistApi } from "../../api/wishlistApi";
import { formatCurrency } from "../../utils/format";
import { showErrorToast, showSuccessToast, showWarningToast, showInfoToast } from "../../utils/toastHelper";
import { Button } from "../UI/Button";
import { Badge } from "../UI/Badge";
import QuickVariantModal from "./QuickVariantModal";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const compareItems = useSelector(selectCompareItems);
  const isInCompare = compareItems.some((item) => Number(item.id) === Number(product?.id));
  const userId = user?.id;
  const token = user?.accessToken;

  const [loadingCart, setLoadingCart] = useState(false);
  const [showQuickModal, setShowQuickModal] = useState(false);
  const [fullProduct, setFullProduct] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Initialize wishlist status if user is logged in
  React.useEffect(() => {
    if (userId && product.wishlists) {
      const wishlisted = product.wishlists.some((w) => w.userId === userId);
      setIsWishlisted(wishlisted);
    }
  }, [userId, product.wishlists]);

  const {
    id,
    name,
    slug,
    price,
    displayPrice,
    discount = 0,
    stock,
    totalStock,
    sold,
    image,
    isActive,
    reviews = [],
    flashSaleActive = false,
    flashSaleDiscount = 0,
    originalPrice: flashOriginalPrice,
    basePrice,
    hasVariants,
  } = product;

  // Tính toán tồn kho thực tế: hỗ trợ cả totalStock (backend DB field), stock và tổng biến thể
  const effectiveStock = useMemo(() => {
    const rawStock = product.totalStock ?? product.stock;
    if (rawStock != null && Number(rawStock) > 0) return Number(rawStock);
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      const variantStock = product.variants.reduce(
        (sum, v) => sum + Number(v.stock || v.quantity || 0),
        0
      );
      if (variantStock > 0) return variantStock;
    }
    return rawStock != null ? Number(rawStock) : 0;
  }, [product.totalStock, product.stock, product.variants]);

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!userId) return showWarningToast("Vui lòng đăng nhập để lưu sản phẩm!");

    try {
      if (isWishlisted) {
        await removeFromWishlistApi(id);
        setIsWishlisted(false);
        showInfoToast("Đã xóa khỏi danh sách yêu thích");
      } else {
        await addToWishlistApi(id);
        setIsWishlisted(true);
        showSuccessToast("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      showErrorToast(error, "Không thể cập nhật danh sách yêu thích");
    }
  };

  const handleToggleCompare = (e) => {
    e.stopPropagation();
    if (!id) return;
    if (!isInCompare && compareItems.length >= MAX_COMPARE_ITEMS) {
      return showWarningToast(`Chỉ có thể so sánh tối đa ${MAX_COMPARE_ITEMS} sản phẩm!`);
    }
    dispatch(
      toggleCompareItem({
        id,
        slug,
        name,
        image,
        price: finalPrice,
        categoryName: product?.category?.name || null,
        brandName: product?.brand?.name || null,
      })
    );
    showInfoToast(
      isInCompare
        ? `Đã bỏ "${name}" khỏi danh sách so sánh`
        : `Đã thêm "${name}" vào khay so sánh`,
    );
  };

  const avgRating = useMemo(() => {
    if (product.avgRating != null && !isNaN(product.avgRating)) return Number(product.avgRating);
    if (product.averageRating != null && !isNaN(product.averageRating)) return Number(product.averageRating);
    if (product.rating != null && !isNaN(product.rating)) return Number(product.rating);
    const list = Array.isArray(reviews) ? reviews : [];
    if (!list.length) return 5.0;
    return (
      list.reduce((sum, r) => sum + (r.rating || 0), 0) / list.length
    );
  }, [reviews, product.avgRating, product.averageRating, product.rating]);

  const reviewCount =
    product.reviewCount ??
    product.reviewsCount ??
    product.totalReviews ??
    (Array.isArray(reviews) ? reviews.length : 0);

  // Tổng hợp % giảm giá: ưu tiên flash sale > discount % thông thường
  // Backend đã tính sẵn discountPercent trong applyFlashSaleToProduct
  const effectiveDiscountPct = flashSaleActive
    ? flashSaleDiscount
    : Number(product.discountPercent ?? discount ?? 0);

  // Giá gốc (trước giảm giá)
  const productOriginalPrice = Number(product.basePrice || price || 0);

  // Giá hiển thị cuối (đã trừ giảm giá)
  // displayPrice từ backend đã được tính đúng sau fix
  const finalPrice = Number(displayPrice || basePrice || price);

  const handleAddToCartClick = async (e) => {
    e.stopPropagation();
    if (!isActive) return showErrorToast("Sản phẩm đã ngưng kinh doanh!");

    setLoadingCart(true);
    try {
      let fullP = null;
      try {
        const res = await getProductByIdApi(id);
        if (res.errCode === 0 && res.product) {
          fullP = res.product;
          const checkHasVariants =
            fullP.hasVariants === true ||
            fullP.hasVariants === 1 ||
            fullP.hasVariants === "true" ||
            (Array.isArray(fullP.variants) && fullP.variants.length > 0);

          if (checkHasVariants) {
            setFullProduct(fullP);
            setShowQuickModal(true);
            return;
          }
        }
      } catch (err) {
        console.error("Fetch product for cart error:", err);
        if (hasVariants) {
          showErrorToast("Vui lòng chọn phiên bản sản phẩm ở trang chi tiết!");
          navigate(`/product-detail/${slug || id}`);
          return;
        }
      }

      if (!fullP && hasVariants) {
        showErrorToast("Vui lòng chọn phiên bản sản phẩm ở trang chi tiết!");
        navigate(`/product-detail/${slug || id}`);
        return;
      }

      const currentStock = fullP
        ? (fullP.totalStock ?? fullP.stock ?? effectiveStock)
        : effectiveStock;

      if (currentStock < 1) {
        return showErrorToast("Sản phẩm tạm hết hàng!");
      }

      await executeAddToCart(id, false);
    } finally {
      setLoadingCart(false);
    }
  };

  const executeAddToCart = async (targetId, isVariant = false, showToast = true) => {
    const resolvedProduct = fullProduct || product;
    const resolvedVariantId = isVariant && targetId ? targetId : null;
    const resolvedVariant =
      resolvedVariantId && Array.isArray(resolvedProduct?.variants)
        ? resolvedProduct.variants.find(
            (v) => Number(v.id) === Number(resolvedVariantId),
          ) || null
        : null;

    if (!userId) {
      dispatch(
        addGuestCartItem({
          product: resolvedProduct,
          variant: resolvedVariant,
          quantity: 1,
        }),
      );
      if (showToast) {
        showSuccessToast("Đã thêm vào giỏ hàng!");
      }
      setShowQuickModal(false);
      return {
        id: `guest_${id}_${resolvedVariantId || "base"}`,
        productId: id,
        variantId: resolvedVariantId,
        product: resolvedProduct,
        variant: resolvedVariant,
        quantity: 1,
        finalPrice: calculateFinalPrice(resolvedProduct, resolvedVariant),
      };
    }

    setLoadingCart(true);
    try {
      const payload = {
        productId: id,
        variantId: resolvedVariantId,
        quantity: 1,
      };

      const res = await addCart(payload, token);

      const cartItem = {
        id: res.data.id,
        productId: res.data.productId,
        variantId: res.data.variantId,
        product: res.data.product,
        variant: res.data.variant,
        quantity: res.data.quantity,
        finalPrice: res.data.finalPrice,
      };

      dispatch(addCartItem(cartItem));

      if (showToast) {
        showSuccessToast("Đã thêm vào giỏ hàng!");
      }
      setShowQuickModal(false);
      return cartItem; // Trả về để dùng cho Mua ngay
    } catch (err) {
      console.error(err);
      showErrorToast(err, "Không thể thêm sản phẩm vào giỏ hàng");
      return null;
    } finally {
      setLoadingCart(false);
    }
  };

  const handleBuyNow = async (targetId, isVariant = false) => {
    const resolvedProduct = fullProduct || product;
    const resolvedVariantId = isVariant && targetId ? targetId : null;
    const resolvedVariant =
      resolvedVariantId && Array.isArray(resolvedProduct?.variants)
        ? resolvedProduct.variants.find((v) => Number(v.id) === Number(resolvedVariantId)) || null
        : null;
    const buyNowItem = {
      id: `buynow_${id}_${resolvedVariantId || "base"}`,
      productId: id,
      variantId: resolvedVariantId,
      quantity: 1,
      product: resolvedProduct,
      variant: resolvedVariant,
      finalPrice: calculateFinalPrice(resolvedProduct, resolvedVariant),
    };
    dispatch(setBuyNowCheckout([buyNowItem]));
    setShowQuickModal(false);
    if (!userId) {
      showInfoToast("Vui lòng đăng nhập để hoàn tất đơn hàng!");
      navigate("/login?redirect=/checkout");
      return;
    }
    navigate("/checkout", {
      state: {
        selectedItems: [buyNowItem],
        mode: "buy_now",
      },
    });
  };

  return (
    <>
      <Motion.article
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        viewport={{ once: true }}
        className={`group relative flex flex-col h-full bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-slate-800/80 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-[box-shadow,border-color,opacity] duration-300 cursor-pointer min-w-0 ${!isActive ? "opacity-60 grayscale pointer-events-none" : ""}`}
        onClick={() => navigate(`/product-detail/${slug || id}`)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-slate-50/70 dark:bg-dark-bg/50 p-4 flex items-center justify-center border-b border-slate-100/80 dark:border-slate-800/60">
          <img
            src={image || "/images/no-image.png"}
            alt={name}
            loading="lazy"
            className="w-full h-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-108"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {flashSaleActive && effectiveDiscountPct > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold shadow-sm shadow-red-500/30">
                ⚡ -{Math.round(effectiveDiscountPct)}%
              </span>
            ) : effectiveDiscountPct > 0 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-sm shadow-blue-500/20">
                -{Math.round(effectiveDiscountPct)}%
              </span>
            ) : null}
          </div>

          {/* Wishlist & Compare Buttons */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
            <button
              type="button"
              onClick={handleWishlist}
              aria-label={isWishlisted ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
              className="size-8.5 flex items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200/70 dark:border-slate-700/70 rounded-full shadow-xs hover:scale-110 transition-all active:scale-95 group/heart cursor-pointer"
            >
              {isWishlisted ? (
                <FaHeart className="text-rose-500" size={14} />
              ) : (
                <FiHeart
                  className="text-slate-400 group-hover/heart:text-rose-500 transition-colors"
                  size={14}
                />
              )}
            </button>

            <button
              type="button"
              onClick={handleToggleCompare}
              aria-label={isInCompare ? "Bỏ khỏi so sánh" : "Thêm vào so sánh"}
              title={isInCompare ? "Đang trong khay so sánh" : "So sánh"}
              className={`size-8.5 flex items-center justify-center backdrop-blur-xs border rounded-full shadow-xs hover:scale-110 transition-all active:scale-95 cursor-pointer ${
                isInCompare
                  ? "bg-primary text-white border-primary"
                  : "bg-white/90 dark:bg-slate-900/90 text-slate-400 border-slate-200/70 dark:border-slate-700/70 hover:text-primary"
              }`}
            >
              <ArrowLeftRight size={14} />
            </button>
          </div>

          {/* Mobile quick add button */}
          <div className="absolute bottom-3 right-3 lg:hidden">
            <button
              type="button"
              onClick={handleAddToCartClick}
              disabled={loadingCart || effectiveStock <= 0}
              aria-label={effectiveStock <= 0 ? "Sản phẩm tạm hết hàng" : "Thêm vào giỏ hàng"}
              className="size-8.5 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer disabled:bg-surface-400 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <FiShoppingCart size={15} />
            </button>
          </div>

          {/* Desktop hover action */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-all duration-200 z-20 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 hidden lg:block">
            <button
              type="button"
              className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 disabled:bg-surface-400 disabled:shadow-none disabled:cursor-not-allowed"
              onClick={handleAddToCartClick}
              disabled={loadingCart || effectiveStock <= 0}
            >
              <FiShoppingCart size={14} />
              {effectiveStock <= 0
                ? "Tạm hết hàng"
                : loadingCart
                ? "Đang xử lý..."
                : "Thêm vào giỏ"}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5 min-w-0 min-h-[16px]">
            <p className="text-[11px] font-bold text-primary dark:text-blue-400 uppercase tracking-wide truncate min-w-0">
              {product.brand?.name || ""}
            </p>
            {/* Stock indicator */}
            <span className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium shrink-0 whitespace-nowrap">
              <span className={`size-1.5 rounded-full ${effectiveStock > 0 ? "bg-emerald-500" : "bg-red-500"}`}></span>
              {effectiveStock > 0 ? "Còn hàng" : "Tạm hết"}
            </span>
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug mb-2 h-[2.15rem] sm:h-[2.5rem] group-hover:text-primary dark:group-hover:text-blue-400 transition-colors break-words [overflow-wrap:anywhere]">
            {name}
          </h3>

          {/* Mini Specs - Attributes (reserved height to prevent card text shift) */}
          <div className="flex items-center gap-1 mb-2 min-h-[22px] overflow-hidden">
            {product.attributes &&
              product.attributes
                .filter((attr) =>
                  ["ram", "rom", "refresh_rate"].includes(attr.attribute?.code),
                )
                .slice(0, 3)
                .map((attr, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800/80 text-[10px] font-medium text-slate-600 dark:text-slate-300 rounded-md border border-slate-100 dark:border-slate-800 truncate max-w-[90px]"
                  >
                    {attr.value}
                  </span>
                ))}
          </div>

          <div className="flex items-center gap-1.5 mb-2.5 text-[10px] min-w-0">
            <div className="flex items-center gap-1 shrink-0">
              <div
                className="flex text-amber-400 text-[9px] gap-0.5"
                aria-label={`Đánh giá ${Number(avgRating || 5).toFixed(1)} sao`}
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar
                    key={i}
                    className={
                      Number(avgRating || 5) >= i + 1
                        ? "fill-current"
                        : "text-slate-200 dark:text-slate-700"
                    }
                  />
                ))}
              </div>
              <span className="font-bold text-amber-500 dark:text-amber-400 font-mono text-[10px] leading-none">
                {Number(avgRating || 5).toFixed(1)}
              </span>
            </div>
            <span className="font-mono text-slate-400 dark:text-slate-500 shrink-0">
              ({reviewCount})
            </span>
            {sold > 0 && (
              <span className="font-mono text-slate-400 dark:text-slate-500 ml-auto truncate">
                Đã bán {sold}
              </span>
            )}
          </div>

          <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1 min-w-0 min-h-[42px]">
            <div className="min-w-0 flex-1 flex flex-col justify-center">
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-none font-mono truncate">
                {formatCurrency(finalPrice)}
              </p>
              {effectiveDiscountPct > 0 && productOriginalPrice > finalPrice ? (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 line-through font-mono leading-none mt-1 truncate">
                  {formatCurrency(productOriginalPrice)}
                </p>
              ) : (
                <span className="text-[10px] leading-none mt-1 opacity-0 select-none" aria-hidden="true">
                  0₫
                </span>
              )}
            </div>
          </div>
        </div>
      </Motion.article>

      {/* Quick Variant Selection Modal */}
      {fullProduct && (
        <QuickVariantModal
          isOpen={showQuickModal}
          onClose={() => setShowQuickModal(false)}
          product={fullProduct}
          onAdd={(variantId) => executeAddToCart(variantId, true)}
          onBuyNow={handleBuyNow}
        />
      )}
    </>
  );
};

export default React.memo(ProductCard);
