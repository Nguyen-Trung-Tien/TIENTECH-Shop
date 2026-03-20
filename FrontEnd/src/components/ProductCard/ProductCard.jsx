import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { addCart, getAllCarts, createCart } from "../../api/cartApi";
import { addCartItem } from "../../redux/cartSlice";
import { getImage } from "../../utils/decodeImage";
import { FiShoppingCart, FiTruck } from "react-icons/fi";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import Button from "../UI/Button";
import Badge from "../UI/Badge";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const userId = user?.id;
  const token = user?.accessToken;

  const [loadingCart, setLoadingCart] = useState(false);

  const {
    id,
    name,
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
  } = product;

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return (
      reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
    );
  }, [reviews]);

  const productOriginalPrice = flashSaleActive
    ? Number(flashOriginalPrice || basePrice || price)
    : Number(basePrice || price);

  const finalPrice = Number(displayPrice || price);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!userId) return toast.warn("Vui lòng đăng nhập!");
    if (!isActive || stock < 1) return toast.error("Hết hàng!");

    setLoadingCart(true);
    try {
      const cartsRes = await getAllCarts(token);
      let cart = cartsRes?.data?.find((c) => c.userId === userId);
      if (!cart) {
        const newCartRes = await createCart(userId, token);
        cart = newCartRes.data;
      }
      const res = await addCart(
        { cartId: cart.id, productId: id, quantity: 1 },
        token,
      );
      dispatch(
        addCartItem({
          id: res.data.id,
          product: res.data.product,
          quantity: res.data.quantity,
        }),
      );
      toast.success(`Đã thêm vào giỏ`);
    } catch (err) {
      toast.error("Lỗi thêm giỏ hàng");
    } finally {
      setLoadingCart(false);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group card-ecommerce relative flex flex-col h-full cursor-pointer ${!isActive ? "opacity-60 grayscale pointer-events-none" : ""}`}
      onClick={() => navigate(`/product-detail/${id}`)}
    >
      {/* Image Area - Aspect ratio 1:1 for compactness */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={getImage(image)}
          alt={name}
          loading="lazy"
          className="w-full h-full object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
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

        {/* Mobile quick add button */}
        <div className="absolute bottom-2 right-2 lg:hidden">
          <Button
            variant="primary"
            size="icon"
            icon={FiShoppingCart}
            onClick={handleAddToCart}
            loading={loadingCart}
            className="rounded-full shadow-lg"
          />
        </div>

        {/* Desktop hover action */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 bg-gradient-to-t from-white/90 to-transparent hidden lg:block">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            icon={FiShoppingCart}
            onClick={handleAddToCart}
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
  );
};

export default React.memo(ProductCard);
