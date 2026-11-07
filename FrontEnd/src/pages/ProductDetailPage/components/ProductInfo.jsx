import React, { useState } from "react";
import {
  FiZap,
  FiClock,
  FiShoppingCart,
  FiCreditCard,
  FiHeart,
  FiTrendingUp,
  FiCheck,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiCompass,
  FiAward,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { motion as Motion, AnimatePresence } from "framer-motion";

const FENG_SHUI_ELEMENTS = {
  kim: {
    name: "Mệnh Kim",
    icon: "🪙",
    colors: "Trắng, Bạc, Ghi, Vàng kim",
    compat: "Thổ sinh Kim - Hợp màu Trắng, Xám, Bạc & Vàng đất",
    advice: "Thiết bị màu bạc hoặc trắng titan giúp gia tăng sự tập trung, quyết đoán và thu hút quý nhân trợ vận.",
    accent: "border-amber-300/80 bg-amber-50/70 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300",
  },
  moc: {
    name: "Mệnh Mộc",
    icon: "🌿",
    colors: "Xanh lục, Xanh lá, Đen",
    compat: "Thủy sinh Mộc - Hợp màu Xanh lá, Xanh navy & Đen huyền bí",
    advice: "Sản phẩm mang sắc xanh hoặc đen kích thích nguồn cảm hứng sáng tạo dồi dào, thăng tiến công danh.",
    accent: "border-emerald-300/80 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300",
  },
  thuy: {
    name: "Mệnh Thủy",
    icon: "🌊",
    colors: "Xanh dương, Đen, Trắng ánh kim",
    compat: "Kim sinh Thủy - Hợp màu Xanh biển, Đen & Trắng ánh kim",
    advice: "Thiết bị mang hành Thủy giúp dòng chảy thông tin và tài vận hanh thông, công việc trôi chảy như nước xuôi dòng.",
    accent: "border-blue-300/80 bg-blue-50/70 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300",
  },
  hoa: {
    name: "Mệnh Hỏa",
    icon: "🔥",
    colors: "Đỏ, Cam, Tím, Xanh lục",
    compat: "Mộc sinh Hỏa - Hợp màu Đỏ, Cam, Hồng, Tím & Xanh lá",
    advice: "Năng lượng Hỏa kích hoạt nhiệt huyết, uy tín và danh tiếng rạng rỡ trong sự nghiệp kinh doanh.",
    accent: "border-rose-300/80 bg-rose-50/70 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300",
  },
  tho: {
    name: "Mệnh Thổ",
    icon: "🏔️",
    colors: "Vàng cát, Nâu đất, Đỏ, Cam",
    compat: "Hỏa sinh Thổ - Hợp màu Nâu, Vàng cát, Đỏ & Cam ấm",
    advice: "Năng lượng Thổ tạo nền móng vững như bàn thạch, tích lũy tài sản và tài chính an toàn lâu dài.",
    accent: "border-stone-300/80 bg-amber-50/50 dark:bg-stone-900/30 text-amber-900 dark:text-amber-200",
  },
};

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
  addingCart,
}) => {
  const [selectedFengShui, setSelectedFengShui] = useState(null);
  const [showFengShuiDrawer, setShowFengShuiDrawer] = useState(false);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return {
      h: String(h).padStart(2, "0"),
      m: String(m).padStart(2, "0"),
      s: String(s).padStart(2, "0"),
    };
  };

  const { h, m, s } = formatTime(timeLeft);
  const savingsAmount = Math.max(0, originalPrice - currentPrice);

  return (
    <div className="lg:col-span-7 flex flex-col space-y-6 min-w-0">
      {/* Brand & Auspicious Tags */}
      <div className="space-y-3">
        <div className="flex items-center flex-wrap gap-2 min-w-0">
          {product.brand && (
            <span className="bg-primary/10 text-primary dark:text-primary-light text-[10px] font-black px-2.5 py-1 rounded-xl border border-primary/20 uppercase tracking-wider">
              {product.brand.name}
            </span>
          )}
          <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
            <FiAward className="size-3" /> Bảo Chứng Chính Hãng
          </span>
          {isFlashSale && (
            <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider flex items-center gap-1 shadow-sm animate-pulse">
              <FiZap className="fill-current size-3" /> FLASH SALE KHAI LỘC
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-snug tracking-tight break-words [overflow-wrap:anywhere]">
          {product.name}
        </h1>

        {/* Social Proof & Ratings */}
        <div className="flex items-center flex-wrap gap-3 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              document
                .getElementById("reviews-section")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer text-left"
          >
            <div className="flex text-amber-400 text-sm tracking-tighter drop-shadow-xs">
              {ratingStars}
            </div>
            <span className="text-slate-900 dark:text-white font-bold">
              {averageRating}
            </span>
            <span className="text-slate-400 dark:text-dark-text-secondary text-[11px]">
              (Đánh giá tin cậy)
            </span>
          </button>
          <span className="text-slate-200 dark:text-dark-border">|</span>
          <span className="text-slate-500 dark:text-dark-text-secondary">
            Đã bán:{" "}
            <span className="text-slate-900 dark:text-white font-bold">
              {product.sold || 0}
            </span>
          </span>
          <span className="text-slate-200 dark:text-dark-border">|</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
            Vượng khí tích lũy
          </span>
        </div>
      </div>

      {/* Flash Sale Banner */}
      {isFlashSale && (
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white p-3.5 sm:p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-red-500/15">
          <div className="flex items-center gap-2 font-black text-xs sm:text-sm uppercase tracking-wider">
            <FiClock className="text-base sm:text-lg animate-bounce" /> FLASH SALE KẾT THÚC SAU:
          </div>
          <div className="flex gap-1.5 font-mono font-black text-xs sm:text-sm">
            <span className="bg-black/35 backdrop-blur-xs text-white px-2 py-1 rounded-lg">
              {h}
            </span>
            <span className="flex items-center">:</span>
            <span className="bg-black/35 backdrop-blur-xs text-white px-2 py-1 rounded-lg">
              {m}
            </span>
            <span className="flex items-center">:</span>
            <span className="bg-black/35 backdrop-blur-xs text-white px-2 py-1 rounded-lg">
              {s}
            </span>
          </div>
        </div>
      )}

      {/* Wealth Accumulation Price Box (Hộp Giá Tụ Tài) */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 dark:from-dark-card dark:via-dark-surface dark:to-dark-card p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-dark-border flex flex-col space-y-2 shadow-xs">
        <div className="flex items-baseline flex-wrap gap-3">
          <span className="text-2xl sm:text-3xl md:text-4xl font-black text-rose-600 dark:text-rose-500 tracking-tight">
            {Number(currentPrice).toLocaleString("vi-VN")}₫
          </span>
          {(isFlashSale || discountPercent > 0) && (
            <span className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500 line-through">
              {Number(originalPrice).toLocaleString("vi-VN")}₫
            </span>
          )}
          {savingsAmount > 0 && (
            <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 rounded-xl shadow-xs">
              ⚡ Tiết kiệm {Number(savingsAmount).toLocaleString("vi-VN")}₫ ({discountPercent}%)
            </span>
          )}
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-dark-border/60">
          <div className="flex items-center gap-2">
            <div
              className={`size-2 rounded-full ${
                (product.totalStock || product.stock) > 0
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-red-500"
              }`}
            />
            <p className="text-xs text-slate-500 dark:text-dark-text-secondary font-bold uppercase tracking-tight">
              {(product.totalStock || product.stock) > 0
                ? `Tình trạng: Còn ${product.totalStock || product.stock} sản phẩm sẵn sàng giao`
                : "Tạm thời hết hàng"}
            </p>
          </div>
          <span className="text-[11px] text-primary dark:text-primary-light font-bold">
            Cam kết giá minh bạch
          </span>
        </div>
      </div>

      {/* Tech Feng Shui Assistant Widget (Góc Phong Thuỷ Công Nghệ - Ngũ Hành Bản Mệnh) */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-50/50 via-white to-blue-50/40 dark:from-dark-card dark:to-dark-surface border border-amber-200/60 dark:border-dark-border space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center text-sm shadow-sm shadow-amber-500/20">
              <FiCompass className="size-4.5" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                Góc Phong Thuỷ Công Nghệ
                <span className="text-[9px] bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Khai Vận
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-dark-text-secondary">
                Chọn Bản Mệnh để xem gợi ý màu sắc tương sinh & thu hút may mắn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowFengShuiDrawer(!showFengShuiDrawer)}
            className="text-[11px] font-bold text-primary dark:text-primary-light hover:underline cursor-pointer shrink-0"
          >
            {showFengShuiDrawer ? "Thu gọn" : "Xem chi tiết"}
          </button>
        </div>

        {/* Element Selection Pills */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {Object.entries(FENG_SHUI_ELEMENTS).map(([key, item]) => {
            const isSelected = selectedFengShui === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedFengShui(isSelected ? null : key)}
                className={`py-2 px-1 rounded-2xl text-[11px] font-bold transition-all border flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                  isSelected
                    ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30 scale-102"
                    : "bg-white dark:bg-dark-card border-slate-200/80 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:border-amber-400"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="truncate">{item.name.replace("Mệnh ", "")}</span>
              </button>
            );
          })}
        </div>

        {/* Element Insights Box */}
        <AnimatePresence>
          {selectedFengShui && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                FENG_SHUI_ELEMENTS[selectedFengShui].accent
              }`}
            >
              <div className="font-extrabold flex items-center gap-1.5">
                <span>{FENG_SHUI_ELEMENTS[selectedFengShui].icon}</span>
                <span>{FENG_SHUI_ELEMENTS[selectedFengShui].name}:</span>
                <span className="font-medium">
                  {FENG_SHUI_ELEMENTS[selectedFengShui].compat}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {FENG_SHUI_ELEMENTS[selectedFengShui].advice}
              </p>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Price Insight Callout */}
      <div className="p-3.5 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 dark:from-dark-card dark:to-dark-surface border border-blue-100 dark:border-dark-border rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 bg-primary text-white rounded-xl shadow-sm shadow-primary/20 flex items-center justify-center shrink-0">
            <FiTrendingUp className="size-4.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 truncate">
              Phân tích giá AI:{" "}
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                Mức giá tối ưu tài lộc
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-dark-text-secondary truncate">
              Thời điểm vàng thích hợp để rước thiết bị về sử dụng
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowPrediction(true)}
          className="px-3.5 py-1.5 text-xs font-semibold text-primary dark:text-primary-light bg-white dark:bg-dark-surface border border-blue-200 dark:border-dark-border rounded-xl hover:shadow-xs transition shrink-0 cursor-pointer"
        >
          Dự báo giá AI
        </button>
      </div>

      {/* Variant Selector */}
      {Object.keys(allAttributes).length > 0 && (
        <div className="space-y-4 py-4 border-y border-slate-100 dark:border-dark-border">
          {Object.entries(allAttributes).map(([attrName, values]) => (
            <div key={attrName} className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Chọn {attrName}:
                </span>
                {selectedAttributes[attrName] && (
                  <span className="font-semibold text-primary dark:text-primary-light bg-primary/10 px-2.5 py-0.5 rounded-full">
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
                      className={`min-w-[70px] px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-primary border-primary text-white shadow-md shadow-primary/25 ring-2 ring-primary/20"
                          : isAvailable
                          ? "bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border text-slate-700 dark:text-slate-300 hover:border-primary/60 hover:text-primary"
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

      {/* Tứ Trụ Bình An (Four Core Guarantees) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50/80 dark:bg-dark-card/60 border border-slate-100 dark:border-dark-border rounded-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-0">
          <div className="size-7 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-400 flex items-center justify-center shrink-0">
            <FiShield size={14} />
          </div>
          <span className="truncate">Chính hãng 100%</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-0">
          <div className="size-7 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FiRefreshCw size={14} />
          </div>
          <span className="truncate">1 Đổi 1 30 Ngày</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-0">
          <div className="size-7 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FiAward size={14} />
          </div>
          <span className="truncate">Bảo hành 24T</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-0">
          <div className="size-7 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <FiTruck size={14} />
          </div>
          <span className="truncate">Giao siêu tốc 2H</span>
        </div>
      </div>

      {/* Action Buttons (Cặp Nút Hành Động Tụ Lộc) */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-1 gap-2.5">
            <button
              onClick={onAddToCart}
              disabled={
                addingCart || (!selectedVariant && product.variants?.length > 0)
              }
              className={`flex-1 h-13 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                !selectedVariant && product.variants?.length > 0
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200/50 cursor-not-allowed"
                  : "bg-white dark:bg-dark-surface border-slate-200 dark:border-dark-border text-slate-800 dark:text-white hover:border-primary dark:hover:border-primary shadow-xs hover:shadow-md"
              }`}
            >
              <FiShoppingCart className="text-base text-primary" />
              <span>{addingCart ? "Đang thêm..." : "Thêm vào giỏ"}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={
                addingCart || (!selectedVariant && product.variants?.length > 0)
              }
              className={`flex-[1.4] h-13 rounded-2xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 cursor-pointer relative overflow-hidden group ${
                !selectedVariant && product.variants?.length > 0
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-primary via-indigo-600 to-primary text-white hover:opacity-95 active:scale-98"
              }`}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
              <FiCreditCard className="text-base" />
              <span>Mua ngay - Rước Lộc</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            disabled={loadingWishlist}
            aria-label={
              isWishlisted
                ? "Xóa khỏi danh sách yêu thích"
                : "Thêm vào danh sách yêu thích"
            }
            className={`w-full sm:size-13 h-13 rounded-2xl border flex items-center justify-center transition-all shadow-xs cursor-pointer shrink-0 ${
              isWishlisted
                ? "border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 text-rose-500"
                : "border-slate-200 dark:border-dark-border text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-card hover:text-rose-500"
            }`}
          >
            {isWishlisted ? (
              <FaHeart className="text-lg" />
            ) : (
              <FiHeart className="text-lg" />
            )}
          </button>
        </div>

        {!selectedVariant && product.variants?.length > 0 && (
          <p className="text-center text-rose-600 dark:text-rose-400 text-xs font-semibold bg-rose-50 dark:bg-rose-950/30 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40">
            Vui lòng chọn phân loại sản phẩm (màu sắc/cấu hình) trước khi đặt mua
          </p>
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductInfo);
