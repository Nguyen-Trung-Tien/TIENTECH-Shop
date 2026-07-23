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
      <div className="grid grid-cols-3 gap-3 p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <FiShield className="text-blue-600 text-lg shrink-0" />
          <span>Chính hãng 100%</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <FiRefreshCw className="text-emerald-600 text-lg shrink-0" />
          <span>1 Đổi 1 30 Ngày</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <FiTruck className="text-indigo-600 text-lg shrink-0" />
          <span>Giao siêu tốc 2H</span>
        </div>
      </div>

      {/* AI Price Insight Callout */}
      <div className="p-3.5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
            <FiTrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              AI Price Insight: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Mức giá cạnh tranh</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Đề xuất: <span className="font-semibold text-indigo-600 dark:text-indigo-400">Thời điểm tốt để mua ngay</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowPrediction(true)}
          className="px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-600 hover:text-white transition shrink-0 shadow-xs cursor-pointer"
        >
          Dự báo giá 30 ngày
        </button>
      </div>

      {/* Variant Selector */}
      {Object.keys(allAttributes).length > 0 && (
        <div className="space-y-4 py-3 border-y border-slate-200/80 dark:border-slate-800">
          {Object.entries(allAttributes).map(([attrName, values]) => (
            <div key={attrName} className="space-y-2.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Chọn {attrName}:
                </label>
                {selectedAttributes[attrName] && (
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800">
                    {selectedAttributes[attrName]}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {values.map((val) => {
                  const isSelected = selectedAttributes[attrName] === val;
                  const isAvailable = checkAttributeAvailability(attrName, val);
                  return (
                    <button
                      key={val}
                      disabled={!isAvailable}
                      onClick={() => onSelectAttribute(attrName, val)}
                      className={`min-w-[65px] px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20"
                          : isAvailable
                            ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-500/60 text-slate-800 dark:text-slate-200"
                            : "bg-slate-100 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50"
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
          <div className="flex flex-1 gap-3">
            <button
              onClick={onAddToCart}
              disabled={addingCart || (!selectedVariant && product.variants?.length > 0)}
              className={`flex-1 h-13 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-2 cursor-pointer ${
                !selectedVariant && product.variants?.length > 0
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200/50 cursor-not-allowed"
                  : "bg-white dark:bg-slate-900 border-slate-900 dark:border-slate-200 text-slate-900 dark:text-white hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900"
              }`}
            >
              <FiShoppingCart className="text-lg" />
              {addingCart ? "Đang thêm..." : "THÊM GIỎ HÀNG"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={addingCart || (!selectedVariant && product.variants?.length > 0)}
              className={`flex-[1.4] h-13 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                !selectedVariant && product.variants?.length > 0
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25 active:scale-98"
              }`}
            >
              <FiCreditCard className="text-lg" />
              MUA NGAY
            </button>
          </div>

          <button
            onClick={handleWishlist}
            disabled={loadingWishlist}
            className={`w-full sm:size-13 h-13 rounded-2xl border-2 flex items-center justify-center transition-all shadow-sm cursor-pointer shrink-0 ${
              isWishlisted
                ? "border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/30 text-red-500"
                : "border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-500"
            }`}
          >
            {isWishlisted ? <FaHeart className="text-xl" /> : <FiHeart className="text-xl" />}
          </button>
        </div>

        {!selectedVariant && product.variants?.length > 0 && (
          <p className="text-center text-red-500 text-xs font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/30 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40">
            ⚠️ Vui lòng chọn phiên bản trước khi tiếp tục
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductInfo);
