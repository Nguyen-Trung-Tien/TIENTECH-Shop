import React from "react";
import { FiZap, FiClock, FiShoppingCart, FiCreditCard, FiHeart, FiTrendingUp, FiCheck, FiShield, FiTruck, FiRefreshCw } from "react-icons/fi";
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

  const savingsAmount = Math.max(0, originalPrice - currentPrice);

  return (
    <div className="lg:col-span-7 flex flex-col space-y-6">
      {/* Product Title & Brand */}
      <div className="space-y-3">
        <div className="flex items-center flex-wrap gap-2">
          {product.brand && (
            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-800 uppercase tracking-wider">
              {product.brand.name}
            </span>
          )}
          {isFlashSale && (
            <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <FiZap className="fill-current size-3" /> FLASH SALE
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-snug tracking-tight">
          {product.name}
        </h1>

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <span className="text-slate-500 dark:text-slate-400">
            Đã bán: <span className="text-slate-900 dark:text-white font-bold">{product.sold || 0}</span>
          </span>
          <span className="text-slate-200 dark:text-slate-800">|</span>
          <button
            type="button"
            onClick={() => {
              document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer text-left"
          >
            <div className="flex text-amber-400 text-sm">
              {ratingStars}
            </div>
            <span className="text-slate-900 dark:text-white font-bold">
              {averageRating}
            </span>
          </button>
        </div>
      </div>

      {/* Flash Sale Banner */}
      {isFlashSale && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 font-black text-xs md:text-sm uppercase tracking-wider">
            <FiClock className="text-lg" /> FLASH SALE KẾT THÚC SAU:
          </div>
          <div className="flex gap-1.5 font-mono font-black text-sm">
            <span className="bg-black/30 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg">{h}</span>
            <span className="flex items-center">:</span>
            <span className="bg-black/30 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg">{m}</span>
            <span className="flex items-center">:</span>
            <span className="bg-black/30 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg">{s}</span>
          </div>
        </div>
      )}

      {/* Price Box */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-4 md:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col space-y-2">
        <div className="flex items-baseline flex-wrap gap-3">
          <span className="text-3xl md:text-4xl font-black text-red-600 dark:text-red-500">
            {Number(currentPrice).toLocaleString("vi-VN")}₫
          </span>
          {(isFlashSale || discountPercent > 0) && (
            <span className="text-sm md:text-base font-medium text-slate-400 dark:text-slate-500 line-through">
              {Number(originalPrice).toLocaleString("vi-VN")}₫
            </span>
          )}
          {savingsAmount > 0 && (
            <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg">
              Tiết kiệm {Number(savingsAmount).toLocaleString("vi-VN")}₫ ({discountPercent}%)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <div className={`size-2 rounded-full ${(product.totalStock || product.stock) > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight">
            {(product.totalStock || product.stock) > 0
              ? `Tình trạng: Còn ${product.totalStock || product.stock} sản phẩm`
              : "Hết hàng tạm thời"}
          </p>
        </div>
      </div>

      {/* Guarantee & Perks Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5 p-3 sm:p-3.5 bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-0">
          <div className="size-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 flex items-center justify-center shrink-0">
            <FiShield size={14} />
          </div>
          <span className="truncate">Chính hãng 100%</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-0">
          <div className="size-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FiRefreshCw size={14} />
          </div>
          <span className="truncate">1 Đổi 1 30 Ngày</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-0">
          <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <FiTruck size={14} />
          </div>
          <span className="truncate">Giao hàng 2H</span>
        </div>
      </div>

      {/* AI Price Insight Callout */}
      <div className="p-3.5 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 dark:from-slate-900/60 dark:to-slate-800/40 border border-blue-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 bg-primary text-white rounded-xl shadow-sm shadow-blue-500/20 flex items-center justify-center shrink-0">
            <FiTrendingUp className="size-4.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
              Phân tích giá AI: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Mức giá hợp lý</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Thời điểm thích hợp để đặt mua sản phẩm này
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowPrediction(true)}
          className="px-3.5 py-1.5 text-xs font-semibold text-primary dark:text-blue-400 bg-white dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-xl hover:shadow-xs transition shrink-0 cursor-pointer"
        >
          Xem dự báo giá
        </button>
      </div>

      {/* Variant Selector */}
      {Object.keys(allAttributes).length > 0 && (
        <div className="space-y-4 py-3.5 border-y border-slate-100 dark:border-slate-800/80">
          {Object.entries(allAttributes).map(([attrName, values]) => (
            <div key={attrName} className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Chọn {attrName}:
                </span>
                {selectedAttributes[attrName] && (
                  <span className="font-semibold text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full">
                    {selectedAttributes[attrName]}
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
                      className={`min-w-[68px] px-4 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-primary border-primary text-white shadow-sm shadow-blue-500/25 ring-2 ring-primary/20"
                          : isAvailable
                            ? "bg-white dark:bg-dark-surface border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary/60 hover:text-primary"
                            : "bg-slate-50 dark:bg-slate-800/40 border-slate-200/40 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50"
                      }`}
                    >
                      {val}
                      {isSelected && <FiCheck className="size-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-1 gap-2.5">
            <button
              onClick={onAddToCart}
              disabled={addingCart || (!selectedVariant && product.variants?.length > 0)}
              className={`flex-1 h-12 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                !selectedVariant && product.variants?.length > 0
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200/50 cursor-not-allowed"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:border-primary dark:hover:border-primary shadow-xs hover:shadow-sm"
              }`}
            >
              <FiShoppingCart className="text-base text-primary" />
              {addingCart ? "Đang thêm..." : "Thêm vào giỏ"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={addingCart || (!selectedVariant && product.variants?.length > 0)}
              className={`flex-[1.4] h-12 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer ${
                !selectedVariant && product.variants?.length > 0
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-primary hover:bg-primary-hover text-white active:scale-98"
              }`}
            >
              <FiCreditCard className="text-base" />
              Mua ngay
            </button>
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            disabled={loadingWishlist}
            aria-label={isWishlisted ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
            className={`w-full sm:size-12 h-12 rounded-2xl border flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0 ${
              isWishlisted
                ? "border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-500"
                : "border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-rose-500"
            }`}
          >
            {isWishlisted ? <FaHeart className="text-lg" /> : <FiHeart className="text-lg" />}
          </button>
        </div>

        {!selectedVariant && product.variants?.length > 0 && (
          <p className="text-center text-rose-600 dark:text-rose-400 text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40">
            Vui lòng chọn phân loại sản phẩm trước khi mua hàng
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductInfo);
