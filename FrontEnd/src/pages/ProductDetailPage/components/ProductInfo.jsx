import React from "react";
import { FiZap, FiClock, FiShoppingCart, FiCreditCard, FiHeart, FiTrendingUp, FiCheck } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

const ProductInfo = ({
  product,
  isFlashSale,
  timeLeft,
  currentPrice,
  originalPrice,
  discountPercent,
  ratingStars,
  averageRating,
  allAttributes,
  selectedAttributes,
  onSelectAttribute,
  checkAttributeAvailability,
  onAddToCart,
  handleBuyNow,
  handleWishlist,
  isWishlisted,
  loadingWishlist,
  setShowPrediction,
  selectedVariant,
  addingCart
}) => {
  const { h, m, s } = formatTime(timeLeft);

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      h: String(h).padStart(2, "0"),
      m: String(m).padStart(2, "0"),
      s: String(s).padStart(2, "0"),
    };
  }

  return (
    <div className="lg:col-span-7 flex flex-col space-y-6">
      <div className="space-y-3">
        <div className="flex items-center flex-wrap gap-2">
          {product.brand && (
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              {product.brand.name}
            </span>
          )}
          {isFlashSale && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <FiZap className="fill-current w-3 h-3" /> FLASH SALE
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
          {product.name}
        </h1>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-500 dark:text-dark-text-secondary">
            Đã bán:{" "}
            <span className="text-gray-900 dark:text-white font-semibold">
              {product.sold}
            </span>
          </span>
          <span className="text-gray-200 dark:text-dark-border">|</span>
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400 tracking-tighter">
              {ratingStars}
            </div>
            <span className="text-gray-900 dark:text-white font-bold">
              {averageRating}
            </span>
          </div>
        </div>
      </div>

      {isFlashSale && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm uppercase">
            <FiClock className="text-lg" /> Kết thúc sau:
          </div>
          <div className="flex gap-1.5 font-bold text-sm">
            <span className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center">{h}</span>
            <span className="flex items-center dark:text-white">:</span>
            <span className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center">{m}</span>
            <span className="flex items-center dark:text-white">:</span>
            <span className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center">{s}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-extrabold text-red-600 dark:text-red-500">
            {Number(currentPrice).toLocaleString("vi-VN")}₫
          </span>
          {(isFlashSale || discountPercent > 0) && (
            <span className="text-sm font-medium text-gray-400 dark:text-dark-text-secondary line-through">
              {Number(originalPrice).toLocaleString("vi-VN")}₫
            </span>
          )}
          {discountPercent > 0 && (
            <span className="text-[11px] font-bold text-red-500 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded">
              TIẾT KIỆM {discountPercent}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <div className={`w-2 h-2 rounded-full ${(product.totalStock || product.stock) > 0 ? "bg-green-500" : "bg-red-500"}`}></div>
          <p className="text-xs text-gray-500 dark:text-dark-text-secondary font-medium uppercase tracking-tight">
            {(product.totalStock || product.stock) > 0
              ? `Còn ${product.totalStock || product.stock} sản phẩm`
              : "Hết hàng tạm thời"}
          </p>
        </div>
      </div>

      {Object.keys(allAttributes).length > 0 && (
        <div className="space-y-5 py-4 border-y border-gray-50 dark:border-dark-border">
          {Object.entries(allAttributes).map(([attrName, values]) => (
            <div key={attrName} className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-dark-text-secondary">
                  Chọn {attrName}
                </label>
                {selectedAttributes[attrName] && (
                  <span className="text-[10px] font-bold text-blue-600 dark:text-brand bg-blue-50 dark:bg-brand/10 px-2 py-0.5 rounded-md">
                    Đã chọn: {selectedAttributes[attrName]}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {values.map((val) => {
                  const isSelected = selectedAttributes[attrName] === val;
                  const isAvailable = checkAttributeAvailability(attrName, val);
                  return (
                    <button
                      key={val}
                      disabled={!isAvailable}
                      onClick={() => onSelectAttribute(attrName, val)}
                      className={`min-w-[60px] px-4 py-2 rounded-lg text-xs font-bold transition-all border-2 flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100 dark:shadow-none"
                          : isAvailable
                            ? "bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border hover:border-blue-300 dark:hover:border-brand hover:text-blue-600 dark:hover:text-brand text-gray-700 dark:text-dark-text-primary"
                            : "bg-gray-50 dark:bg-dark-bg border-gray-100 dark:border-dark-border text-gray-300 dark:text-dark-text-secondary cursor-not-allowed opacity-60"
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

      <div className="space-y-4 pt-2">
        <div className="flex gap-3">
          <button
            onClick={onAddToCart}
            disabled={addingCart || (!selectedVariant && product.variants?.length > 0)}
            className={`flex-1 h-12 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-2 ${
              !selectedVariant && product.variants?.length > 0
                ? "bg-gray-50 dark:bg-dark-bg text-gray-300 dark:text-dark-text-secondary border-gray-100 dark:border-dark-border cursor-not-allowed"
                : "bg-white dark:bg-dark-surface border-slate-800 dark:border-white text-slate-800 dark:text-white hover:bg-slate-800 dark:hover:bg-white hover:text-white dark:hover:text-slate-900"
            }`}
          >
            <FiShoppingCart className="text-lg" />
            THÊM GIỎ HÀNG
          </button>

          <button
            onClick={handleBuyNow}
            disabled={addingCart || (!selectedVariant && product.variants?.length > 0)}
            className={`flex-[1.5] h-12 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm ${
              !selectedVariant && product.variants?.length > 0
                ? "bg-gray-100 dark:bg-dark-bg text-gray-300 dark:text-dark-text-secondary cursor-not-allowed"
                : "bg-blue-600 dark:bg-brand text-white hover:bg-blue-700 dark:hover:bg-brand/80 active:scale-95 shadow-blue-100 dark:shadow-none"
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
                ? "border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 text-red-500"
                : "border-gray-100 dark:border-dark-border text-gray-400 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-red-500 hover:border-red-100 dark:hover:border-red-900/30"
            }`}
          >
            {isWishlisted ? <FaHeart className="text-xl" /> : <FiHeart className="text-xl" />}
          </button>
        </div>

        <button
          onClick={() => setShowPrediction(true)}
          className="w-full h-12 rounded-xl bg-slate-50 dark:bg-dark-surface text-slate-600 dark:text-dark-text-secondary border border-slate-200 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-dark-bg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
        >
          <FiTrendingUp className="text-lg text-indigo-600 dark:text-indigo-400" />
          DỰ ĐOÁN GIÁ AI
        </button>

        {!selectedVariant && product.variants?.length > 0 && (
          <p className="text-center text-red-500 text-[10px] font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/30 py-2 rounded-lg">
            ⚠️ Vui lòng chọn phiên bản để tiếp tục mua hàng
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductInfo);
