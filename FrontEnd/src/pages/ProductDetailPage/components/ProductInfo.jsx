import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  FiChevronDown,
  FiChevronUp,
  FiSearch,
  FiMessageSquare,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { getFengShuiDetailApi, fengShuiChatApi } from "../../../api/chatApi";

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
  // Feng Shui Dynamic API State (Không hardcode)
  const [isFengShuiOpen, setIsFengShuiOpen] = useState(false);
  const [birthYear, setBirthYear] = useState("1998");
  const [gender, setGender] = useState("male");
  const [fsData, setFsData] = useState(null);
  const [loadingFs, setLoadingFs] = useState(false);

  // AI Master Chat Consultation
  const [aiAdvice, setAiAdvice] = useState(null);
  const [askingAi, setAskingAi] = useState(false);

  // Fetch Feng Shui Data from Backend API
  const fetchFengShuiData = useCallback(async (yr, gd) => {
    setLoadingFs(true);
    try {
      const res = await getFengShuiDetailApi(yr, gd);
      if (res?.errCode === 0 && res.data) {
        setFsData(res.data);
      }
    } catch (err) {
      console.error("Lỗi tải phong thủy từ máy chủ:", err);
    } finally {
      setLoadingFs(false);
    }
  }, []);

  useEffect(() => {
    fetchFengShuiData(birthYear, gender);
  }, [birthYear, gender, fetchFengShuiData]);

  const handleYearChange = (e) => {
    const yr = e.target.value;
    setBirthYear(yr);
    setAiAdvice(null);
  };

  const handleGenderToggle = () => {
    const nextGd = gender === "male" ? "female" : "male";
    setGender(nextGd);
    setAiAdvice(null);
  };

  // Ask TienTech FengShui Master AI
  const handleAskFengShuiMaster = async () => {
    setAskingAi(true);
    try {
      const prompt = `Tôi sinh năm ${birthYear} (${gender === "male" ? "Nam" : "Nữ"}), đang tìm hiểu đặt mua sản phẩm "${product?.name}". Xin TienTech Master cho lời khuyên phong thủy ngắn gọn về độ hợp mệnh, màu sắc và vị trí đặt máy!`;
      const res = await fengShuiChatApi({
        birthYear: Number(birthYear),
        gender,
        message: prompt,
      });
      if (res?.errCode === 0 && res.data?.reply) {
        setAiAdvice(res.data.reply);
      } else {
        setAiAdvice("Hệ thống phong thủy AI đang bận tiếp nhận năng lượng, vui lòng thử lại sau ít phút.");
      }
    } catch {
      setAiAdvice("Không thể kết nối với TienTech FengShui Master lúc này.");
    } finally {
      setAskingAi(false);
    }
  };

  // Dynamic Color Matching (Đối chiếu từ dữ liệu Backend trả về)
  const variantColorMatch = useMemo(() => {
    if (!fsData || !selectedAttributes) return null;
    const variantColor = (
      selectedAttributes["Màu sắc"] ||
      selectedAttributes["Color"] ||
      selectedVariant?.name ||
      ""
    ).toLowerCase();
    if (!variantColor) return null;

    const allGoodColors = [
      ...(fsData.luckyColors || []),
      ...(fsData.supportColors || []),
    ];

    const isMatch = allGoodColors.some((c) =>
      variantColor.includes(c.toLowerCase()) || c.toLowerCase().includes(variantColor)
    );
    return isMatch;
  }, [fsData, selectedAttributes, selectedVariant]);

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
    <div className="lg:col-span-7 flex flex-col space-y-5 min-w-0">
      {/* Brand & Auspicious Tags */}
      <div className="space-y-2.5">
        <div className="flex items-center flex-wrap gap-2 min-w-0">
          {product.brand && (
            <span className="bg-primary/10 text-primary dark:text-primary-light text-[10px] font-black px-2.5 py-1 rounded-xl border border-primary/20 uppercase tracking-wider">
              {product.brand.name}
            </span>
          )}
          <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-center gap-1">
            <FiAward className="size-3" /> Bảo Chứng Chính Hãng TIENTECH
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

      {/* Góc Phong Thuỷ Công Nghệ Số (Kết nối API Backend động - Không hardcode) */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-50/60 via-white to-blue-50/40 dark:from-dark-card dark:to-dark-surface border border-amber-200/80 dark:border-dark-border overflow-hidden transition-all shadow-xs">
        {/* Widget Header with Toggle */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center text-base shadow-sm shadow-amber-500/20 shrink-0">
              <FiCompass className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 truncate">
                <span>Góc Phong Thuỷ Công Nghệ</span>
                <span className="text-[9px] bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                  Khai Vận
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-dark-text-secondary truncate">
                {loadingFs
                  ? "Đang tra cứu phong thủy..."
                  : fsData
                  ? `Năm ${fsData.year} (${fsData.gender}) • Mệnh ${fsData.menhNien} • Cung ${fsData.cungPhi} (${fsData.element})`
                  : "Tra cứu bản mệnh ngũ hành & màu sắc may mắn từ TienTech Engine"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsFengShuiOpen(!isFengShuiOpen)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border text-xs font-bold text-primary dark:text-primary-light hover:shadow-xs transition shrink-0 cursor-pointer"
          >
            <span>{isFengShuiOpen ? "Thu gọn" : "Xem chi tiết"}</span>
            {isFengShuiOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
        </div>

        {/* Collapsed Compact Preview Bar */}
        {!isFengShuiOpen && fsData && (
          <div className="px-4 pb-3 pt-0 flex items-center justify-between flex-wrap gap-2 text-xs border-t border-slate-100/80 dark:border-dark-border/40 mt-1">
            <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="font-bold text-amber-700 dark:text-amber-400">Màu hợp mệnh:</span>
              <span className="font-medium">
                {fsData.luckyColors?.slice(0, 3).join(", ")}...
              </span>
            </div>
            {variantColorMatch !== null && (
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  variantColorMatch
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-600 dark:bg-dark-card dark:text-slate-400"
                }`}
              >
                {variantColorMatch
                  ? "✨ Màu đang chọn cực hợp mệnh!"
                  : "☯️ Có thể phối thêm ốp lưng tương sinh"}
              </span>
            )}
          </div>
        )}

        {/* Expanded Detailed Interactive Panel */}
        <AnimatePresence>
          {isFengShuiOpen && (
            <Motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="border-t border-amber-200/60 dark:border-dark-border p-4 sm:p-5 space-y-4 bg-white/70 dark:bg-dark-surface/70"
            >
              {/* Year & Gender Selector Grid */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FiSearch className="text-primary" /> Năm sinh:
                  </label>
                  <select
                    value={birthYear}
                    onChange={handleYearChange}
                    className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                  >
                    {Array.from({ length: 45 }, (_, i) => 2012 - i).map((yr) => (
                      <option key={yr} value={yr}>
                        Năm {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Giới tính:</span>
                  <button
                    type="button"
                    onClick={handleGenderToggle}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card text-xs font-bold text-slate-800 dark:text-white hover:border-primary cursor-pointer"
                  >
                    {gender === "male" ? "👨 Nam" : "👩 Nữ"} (Đổi)
                  </button>
                </div>
              </div>

              {/* Dynamic Feng Shui Result Card từ Backend */}
              {fsData && (
                <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs space-y-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-black/10 dark:border-white/10 pb-2">
                    <div className="font-extrabold flex items-center gap-2 text-sm">
                      <span>Cung Phi {fsData.cungPhi} (Hành {fsData.element})</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-black/10 dark:bg-white/10 text-[10px]">
                      Mệnh Niên: {fsData.menhNien}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs leading-relaxed">
                    <div>
                      <strong className="block mb-0.5">🌟 Màu Đại Cát (Tương sinh):</strong>
                      <p className="opacity-90">{fsData.supportColors?.join(", ")}</p>
                    </div>
                    <div>
                      <strong className="block mb-0.5">🎨 Màu Bình An (Bản mệnh):</strong>
                      <p className="opacity-90">{fsData.luckyColors?.join(", ")}</p>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] leading-relaxed border-t border-black/5 dark:border-white/5 space-y-1">
                    <p>
                      <strong>💡 Lời khuyên thiết bị:</strong> {fsData.advice}
                    </p>
                    <p>
                      <strong>🧭 Bố trí bàn làm việc:</strong> {fsData.workspaceTip}
                    </p>
                  </div>
                </div>
              )}

              {/* TienTech FengShui Master AI Consultation Button */}
              <div className="pt-2 border-t border-slate-100 dark:border-dark-border">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Bạn muốn nghe lời khuyên riêng cho sản phẩm này?
                  </div>
                  <button
                    type="button"
                    onClick={handleAskFengShuiMaster}
                    disabled={askingAi}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs shadow-sm hover:opacity-95 transition cursor-pointer"
                  >
                    <FiMessageSquare className="size-3.5" />
                    <span>{askingAi ? "TienTech AI đang xem quẻ..." : "Hỏi TienTech Master AI"}</span>
                  </button>
                </div>

                {/* AI Master Consultation Response */}
                <AnimatePresence>
                  {aiAdvice && (
                    <Motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-3 p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-300/80 text-xs text-slate-800 dark:text-slate-200 leading-relaxed space-y-1.5"
                    >
                      <div className="font-extrabold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                        <span>🧙‍♂️ Lời khuyên từ TienTech FengShui Master:</span>
                      </div>
                      <p className="text-[11px] whitespace-pre-line leading-relaxed">
                        {aiAdvice}
                      </p>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
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
