import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { addCart, getAllCarts, createCart } from "../../api/cartApi";
import { getProductByIdApi } from "../../api/productApi";
import { addCartItem } from "../../redux/cartSlice";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { FaStar, FaHeart } from "react-icons/fa";
import { addToWishlistApi, removeFromWishlistApi } from "../../api/wishlistApi";
import Button from "../UI/Button";
import Badge from "../UI/Badge";
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
      const wishlisted = product.wishlists.some(w => w.userId === userId);
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
      toast.error("Không thể cập nhật danh sách yêu thích");
    }
  };

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return (
      reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    );
  }, [reviews]);

  const productOriginalPrice = flashSaleActive
    ? Number(flashOriginalPrice || basePrice || price)
    : Number(basePrice || price);

  const finalPrice = Number(displayPrice || basePrice || price);

  const handleAddToCartClick = async (e) => {
    e.stopPropagation();
    if (!userId) return toast.warn("Vui lòng đăng nhập!");
    if (!isActive || (stock < 1 && !hasVariants)) return toast.error("Hết hàng!");

    // Nếu sản phẩm có variant, mở modal chọn option
    if (hasVariants) {
      setLoadingCart(true);
      try {
        const res = await getProductByIdApi(id);
        if (res.errCode === 0) {
          setFullProduct(res.product);
          setShowQuickModal(true);
        } else {
          toast.error("Không thể tải thông tin sản phẩm");
        }
      } catch (err) {
        toast.error("Lỗi kết nối");
      } finally {
        setLoadingCart(false);
      }
      return;
    }

    // Nếu không có variant, thêm thẳng vào giỏ
    await executeAddToCart(id);
  };

  const executeAddToCart = async (targetId, isVariant = false) => {
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
        quantity: 1 
      };
      if (isVariant || hasVariants) {
        payload.variantId = targetId;
      }

      const res = await addCart(payload, token);
      
      const cartItem = {
        id: res.data.id,
        product: res.data.product,
        variant: res.data.variant,
        quantity: res.data.quantity,
        finalPrice: res.data.finalPrice
      };

      dispatch(addCartItem(cartItem));
      
      toast.success(`Đã thêm vào giỏ`);
      setShowQuickModal(false);
      return cartItem; // Trả về để dùng cho Mua ngay
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi thêm giỏ hàng");
      return null;
    } finally {
      setLoadingCart(false);
    }
  };

  const handleBuyNow = async (targetId) => {
    const item = await executeAddToCart(targetId, true);
    if (item) {
      navigate("/checkout", { 
        state: { 
          selectedItems: [item] 
        } 
      });
    }
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={`group card-ecommerce relative flex flex-col h-full cursor-pointer ${!isActive ? "opacity-60 grayscale pointer-events-none" : ""}`}
        onClick={() => navigate(`/product-detail/${slug || id}`)}
      >
        {/* Image Area */}
        <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-dark-bg">
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {flashSaleActive && flashSaleDiscount > 0 && (
              <Badge variant="danger">
                Flash -{Math.round(flashSaleDiscount)}%
              </Badge>
            )}
            {!flashSaleActive && discount > 0 && (
              <Badge variant="brand">-{discount}%</Badge>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 z-20 p-2 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform active:scale-95 group/heart"
          >
            {isWishlisted ? (
              <FaHeart className="text-red-500" size={16} />
            ) : (
              <FiHeart className="text-slate-400 group-hover/heart:text-red-500 transition-colors" size={16} />
            )}
          </button>

          {/* Mobile quick add button */}
          <div className="absolute bottom-2 right-2 lg:hidden">
            <Button
              variant="primary"
              size="icon"
              icon={FiShoppingCart}
              onClick={handleAddToCartClick}
              loading={loadingCart}
              className="rounded-full shadow-lg"
            />
          </div>

          {/* Desktop hover action */}
          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 bg-gradient-to-t from-white/90 dark:from-dark-card/90 to-transparent hidden lg:block">
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              icon={FiShoppingCart}
              onClick={handleAddToCartClick}
              loading={loadingCart}
            >
              THÊM GIỎ HÀNG
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 truncate">
            Official Store
          </p>
          <h3 className="text-xs md:text-sm font-bold text-slate-800 dark:text-white line-clamp-2 leading-tight mb-2 h-8 group-hover:text-primary transition-colors">
            {name}
          </h3>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex text-amber-400 text-[9px]">
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
            {sold > 0 && (
              <span className="text-[9px] text-slate-400 dark:text-slate-500">
                | Đã bán {sold}
              </span>
            )}
          </div>

          <div className="mt-auto pt-2 border-t border-slate-50 dark:border-dark-border">
            <p className="text-base font-black text-slate-900 dark:text-white leading-none">
              {Math.round(finalPrice).toLocaleString("vi-VN")} ₫
            </p>
            {((flashSaleActive && flashOriginalPrice) || discount > 0) && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 line-through mt-1">
                {Math.round(productOriginalPrice).toLocaleString("vi-VN")} ₫
              </p>
            )}
          </div>
        </div>
      </motion.article>

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
