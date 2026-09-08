import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { motion as Motion } from "framer-motion";
import { addCart, getAllCarts, createCart } from "../../api/cartApi";
import { getProductByIdApi } from "../../api/productApi";
import { addCartItem } from "../../redux/cartSlice";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { FaStar, FaHeart } from "react-icons/fa";
import { addToWishlistApi, removeFromWishlistApi } from "../../api/wishlistApi";
import { formatCurrency } from "../../utils/format";
import { showErrorToast, showSuccessToast } from "../../utils/toastHelper";
import { Button } from "../UI/Button";
import { Badge } from "../UI/Badge";
import QuickVariantModal from "./QuickVariantModal";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
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

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!userId) return toast.warn("Vui lòng đăng nhập để lưu sản phẩm!");

    try {
      if (isWishlisted) {
        await removeFromWishlistApi(id);
        setIsWishlisted(false);
        toast.info("Đã xóa khỏi danh sách yêu thích");
      } else {
        await addToWishlistApi(id);
        setIsWishlisted(true);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      showErrorToast(error, "Không thể cập nhật danh sách yêu thích");
    }
  };

  const avgRating = useMemo(() => {
    if (product.avgRating != null) return Number(product.avgRating);
    if (product.averageRating != null) return Number(product.averageRating);
    const list = Array.isArray(reviews) ? reviews : [];
    if (!list.length) return 5;
    return (
      list.reduce((sum, r) => sum + (r.rating || 0), 0) / list.length
    );
  }, [reviews, product.avgRating, product.averageRating]);

  const reviewCount = product.reviewCount ?? product.reviewsCount ?? (Array.isArray(reviews) ? reviews.length : 0);

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
    if (!userId) return toast.warn("Vui lòng đăng nhập!");
    if (!isActive) return toast.error("Sản phẩm đã ngưng kinh doanh!");

    setLoadingCart(true);
    try {
      const res = await getProductByIdApi(id);
      if (res.errCode === 0 && res.product) {
        const fullP = res.product;
        const checkHasVariants =
          fullP.hasVariants === true ||
          fullP.hasVariants === 1 ||
          fullP.hasVariants === "true" ||
          (Array.isArray(fullP.variants) && fullP.variants.length > 0);

        if (checkHasVariants) {
          setFullProduct(fullP);
          setShowQuickModal(true);
          setLoadingCart(false);
          return;
        }
      }
    } catch (err) {
      console.error("Fetch product for cart error:", err);
    }

    if (stock < 1) {
      setLoadingCart(false);
      return toast.error("Sản phẩm tạm hết hàng!");
    }

    await executeAddToCart(id);
  };

  const executeAddToCart = async (targetId, isVariant = false, showToast = true) => {
    setLoadingCart(true);
    try {
      const cartsRes = await getAllCarts(token);
      let cart = cartsRes?.data?.find((c) => c.userId === userId);
      if (!cart) {
        const newCartRes = await createCart(userId, token);
        cart = newCartRes.data;
      }

      const payload = {
        cartId: cart.id,
        productId: id,
        quantity: 1,
      };
      if (isVariant || hasVariants) {
        payload.variantId = targetId;
      }

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

  const handleBuyNow = async (targetId) => {
    const item = await executeAddToCart(targetId, true, false);
    if (item) {
      navigate("/checkout", {
        state: {
          selectedItems: [item],
        },
      });
    }
  };

  return (
    <>
      <Motion.article
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        viewport={{ once: true }}
        className={`group relative flex flex-col h-full bg-white dark:bg-dark-surface rounded-[24px] border border-slate-200/70 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 hover:border-blue-500/40 dark:hover:border-blue-500/50 transition-all duration-300 cursor-pointer ${!isActive ? "opacity-60 grayscale pointer-events-none" : ""}`}
        onClick={() => navigate(`/product-detail/${slug || id}`)}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-slate-50/70 dark:bg-dark-bg/60 p-4 flex items-center justify-center">
          <img
            src={image || "/images/no-image.png"}
            alt={name}
            loading="lazy"
            className="w-full h-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-108"
          />

          {/* Clean Tech Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {flashSaleActive && effectiveDiscountPct > 0 ? (
              <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-md shadow-xs flex items-center gap-0.5">
                ⚡ -{Math.round(effectiveDiscountPct)}%
              </span>
            ) : effectiveDiscountPct > 0 ? (
              <span className="px-2 py-0.5 bg-blue-600 text-white font-black text-[9px] uppercase tracking-wider rounded-md shadow-xs">
                -{Math.round(effectiveDiscountPct)}%
              </span>
            ) : null}
            {Boolean(
              hasVariants === true ||
              hasVariants === 1 ||
              hasVariants === "true" ||
              (Array.isArray(product.variants) && product.variants.length > 0)
            ) && (
              <span className="px-1.5 py-0.5 bg-slate-900/80 dark:bg-slate-800/90 backdrop-blur-sm text-slate-200 font-bold text-[8px] uppercase tracking-wider rounded border border-slate-700/50 w-fit">
                Nhiều phiên bản
              </span>
            )}
          </div>

          {/* Wishlist Button with aria-label */}
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={isWishlisted ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
            className="absolute top-2.5 right-2.5 z-20 size-8 flex items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 rounded-full shadow-xs hover:scale-105 hover:bg-white dark:hover:bg-slate-800 transition-all active:scale-95 group/heart cursor-pointer"
          >
            {isWishlisted ? (
              <FaHeart className="text-rose-500" size={13} />
            ) : (
              <FiHeart
                className="text-slate-400 group-hover/heart:text-rose-500 transition-colors"
                size={13}
              />
            )}
          </button>

          {/* Mobile quick add button */}
          <div className="absolute bottom-3 right-3 lg:hidden">
            <button
              onClick={handleAddToCartClick}
              disabled={loadingCart}
              className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
            >
              <FiShoppingCart size={15} />
            </button>
          </div>

          {/* Desktop hover action */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-all duration-250 z-20 bg-white/95 dark:bg-dark-surface/95 backdrop-blur-sm border-t border-slate-100 dark:border-slate-800 hidden lg:block">
            <Button
              variant="primary"
              size="sm"
              className="w-full !rounded-xl font-bold text-[11px] tracking-wide uppercase py-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              onClick={handleAddToCartClick}
              disabled={loadingCart}
            >
              <FiShoppingCart size={14} className="mr-1.5 inline" />
              {loadingCart ? "Đang xử lý..." : "Thêm giỏ hàng"}
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 truncate">
            {product.brand?.name || "Linh Kiện Chính Hãng"}
          </p>
          <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug mb-2 min-h-[2.5rem] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {name}
          </h3>

          {/* Mini Specs - Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2.5">
              {product.attributes.slice(0, 3).map((attr, idx) => {
                if (
                  ["ram", "rom", "refresh_rate"].includes(attr.attribute?.code)
                ) {
                  return (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800/60 text-[9px] font-bold text-slate-600 dark:text-slate-300 rounded-md border border-slate-200/50 dark:border-slate-700/50"
                    >
                      {attr.value}
                    </span>
                  );
                }
                return null;
              })}
            </div>
          )}

          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex text-amber-400 text-[10px] gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar
                  key={i}
                  className={
                    avgRating >= i + 1
                      ? "fill-current"
                      : "text-slate-200 dark:text-slate-700"
                  }
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400">
              ({reviewCount})
            </span>
            {sold > 0 && (
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 ml-auto">
                Đã bán {sold}
              </span>
            )}
          </div>

          <div className="mt-auto pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between gap-1">
            <div>
              <p className="text-sm md:text-base font-black text-slate-900 dark:text-white leading-none">
                {formatCurrency(finalPrice)}
              </p>
              {effectiveDiscountPct > 0 && productOriginalPrice > finalPrice && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 line-through font-medium leading-none mt-1">
                  {formatCurrency(productOriginalPrice)}
                </p>
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
