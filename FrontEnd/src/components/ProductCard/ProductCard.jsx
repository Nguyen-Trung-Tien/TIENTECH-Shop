import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { addCart, getAllCarts, createCart } from "../../api/cartApi";
import { addCartItem } from "../../redux/cartSlice";
import { getImage } from "../../utils/decodeImage";
import {
  FiShoppingCart,
  FiStar,
  FiTruck,
} from "react-icons/fi";
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
    discount = 0,
    stock,
    sold,
    image,
    isActive,
    reviews = [],
  } = product;

  /* ===== Rating Calculation ===== */
  const { avgRating, totalReviews } = useMemo(() => {
    if (!reviews.length) return { avgRating: 0, totalReviews: 0 };
    const avg = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
    return { avgRating: avg, totalReviews: reviews.length };
  }, [reviews]);

  /* ===== Price Calculation ===== */
  const { rawPrice, finalPrice, hasDiscount } = useMemo(() => {
    const p = Number(price) || 0;
    const discounted = discount > 0 ? p * (1 - discount / 100) : p;
    return {
      rawPrice: Math.round(p),
      finalPrice: Math.round(discounted),
      hasDiscount: discount > 0,
    };
  }, [price, discount]);

  const formatVND = (v) => v.toLocaleString("vi-VN") + " ₫";

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!userId) return toast.warn("Vui lòng đăng nhập!");
    if (!isActive || stock < 1) return toast.error("Sản phẩm tạm thời hết hàng!");

    setLoadingCart(true);
    try {
      const cartsRes = await getAllCarts(token);
      let cart = cartsRes?.data?.find((c) => c.userId === userId);

      if (!cart) {
        const newCartRes = await createCart(userId, token);
        cart = newCartRes.data;
      }

      const res = await addCart({ cartId: cart.id, productId: id, quantity: 1 }, token);

      dispatch(addCartItem({
        id: res.data.id,
        product: res.data.product,
        quantity: res.data.quantity,
      }));

      toast.success(`Đã thêm vào giỏ hàng`);
    } catch (err) {
      console.error(err);
      toast.error("Không thể thêm vào giỏ hàng");
    } finally {
      setLoadingCart(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`group card-ecommerce h-full flex flex-col bg-white border border-surface-200/60 hover:shadow-2xl hover:border-primary/20 cursor-pointer ${
        !isActive ? "opacity-60 grayscale pointer-events-none" : ""
      }`}
      onClick={() => navigate(`/product-detail/${id}`)}
    >
      {/* Visual Area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-50">
        <img
          src={getImage(image)}
          alt={name}
          className="w-full h-full object-contain p-6 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {hasDiscount && (
            <Badge variant="brand" className="shadow-lg shadow-brand/20">
              -{discount}%
            </Badge>
          )}
          {finalPrice >= 1000000 && (
            <Badge variant="success" className="shadow-lg shadow-success/20">
              <FiTruck className="mr-1" /> Free Ship
            </Badge>
          )}
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 bg-gradient-to-t from-white via-white/80 to-transparent">
          <Button 
            className="w-full"
            variant="primary"
            size="md"
            icon={FiShoppingCart}
            onClick={handleAddToCart}
            loading={loadingCart}
          >
            THÊM GIỎ HÀNG
          </Button>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category / Brand (Mock for design) */}
        <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">
          Tien-Tech Official
        </p>

        {/* Product Title */}
        <h3 className="text-[14px] md:text-[15px] font-bold text-surface-900 line-clamp-2 leading-tight mb-3 h-10 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Ratings */}
        <div className="flex items-center gap-1 mb-4">
          <div className="flex text-amber-400 text-[10px]">
            {Array.from({ length: 5 }).map((_, i) => {
              const star = i + 1;
              if (avgRating >= star) return <FaStar key={i} />;
              if (avgRating >= star - 0.5) return <FaStarHalfAlt key={i} />;
              return <FaRegStar key={i} />;
            })}
          </div>
          {totalReviews > 0 && (
            <span className="text-[11px] text-surface-400 font-medium">({totalReviews})</span>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-auto pt-4 border-t border-surface-100/60 flex flex-col">
          {hasDiscount && (
            <span className="text-[12px] text-surface-400 line-through mb-1">
              {formatVND(rawPrice)}
            </span>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[18px] font-black text-surface-900 tracking-tight">
              {formatVND(finalPrice)}
            </span>
            {sold > 0 && (
              <span className="text-[11px] text-surface-400">Đã bán {sold}</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
