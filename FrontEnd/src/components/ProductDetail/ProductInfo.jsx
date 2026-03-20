import React from "react";
import { FiZap } from "react-icons/fi";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const ProductInfo = ({ product, avgRating, totalReviews }) => {
  const activePrice = product.price;
  const discountedPrice = Math.round(product.discount > 0 ? activePrice * (1 - product.discount / 100) : activePrice);

  const formatVND = (val) => val.toLocaleString("vi-VN", { style: "currency", currency: "VND", minimumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      {/* Brand & Category & Rating */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          {product.brand?.name}
        </span>
        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
          {product.category?.name}
        </span>
        
        {totalReviews > 0 && (
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="flex text-amber-400 gap-0.5" aria-label={`Rating: ${avgRating} stars`}>
              {Array.from({ length: 5 }).map((_, i) => {
                const star = i + 1;
                if (avgRating >= star) return <FaStar key={i} size={14} />;
                if (avgRating >= star - 0.5) return <FaStarHalfAlt key={i} size={14} />;
                return <FaRegStar key={i} size={14} className="text-slate-200" />;
              })}
            </div>
            <span className="text-xs font-bold text-slate-400">({totalReviews})</span>
          </div>
        )}
      </div>

      <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 leading-tight">
        {product.name}
      </h1>

      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1"><span className="text-slate-300">SKU:</span> {product.sku}</span>
        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
        <span>Đã bán {product.sold}</span>
        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
        <span className={product.stock > 0 ? "text-emerald-500" : "text-danger"}>
          {product.stock > 0 ? `Còn hàng (${product.stock})` : "Hết hàng"}
        </span>
      </div>

      {/* Pricing Card */}
      <div className="bg-surface-50 rounded-2xl p-6 border border-slate-100">
        <div className="flex items-baseline gap-4">
          <span className="text-4xl font-black text-primary tracking-tighter">
            {formatVND(discountedPrice)}
          </span>
          {product.discount > 0 && (
            <span className="text-xl font-medium text-slate-400 line-through">
              {formatVND(activePrice)}
            </span>
          )}
        </div>
        
        {product.discount > 0 && (
          <p className="mt-2 text-sm font-bold text-emerald-600 flex items-center gap-1.5">
            <FiZap className="fill-current animate-pulse" />
            Tiết kiệm {formatVND(activePrice - discountedPrice)} ({parseFloat(product.discount).toFixed(1)}%)
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductInfo);
