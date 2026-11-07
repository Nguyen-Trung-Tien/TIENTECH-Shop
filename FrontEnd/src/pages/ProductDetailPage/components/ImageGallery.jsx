import React, { useState, useEffect } from "react";
import {
  FiMaximize2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
  FiPackage,
  FiCheckCircle,
} from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";

const ImageGallery = ({
  mainImage,
  setMainImage,
  displayImages,
  discountPercent,
  productName,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Handle ESC key press and lock background scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen]);

  const currentIndex =
    displayImages?.findIndex((img) => img.imageUrl === mainImage) ?? 0;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (!displayImages || displayImages.length === 0) return;
    const prevIdx =
      (currentIndex - 1 + displayImages.length) % displayImages.length;
    setMainImage(displayImages[prevIdx].imageUrl);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (!displayImages || displayImages.length === 0) return;
    const nextIdx = (currentIndex + 1) % displayImages.length;
    setMainImage(displayImages[nextIdx].imageUrl);
  };

  return (
    <div className="lg:col-span-5 space-y-4">
      {/* Main Preview Container with Subtle Aura Glow */}
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100/60 dark:from-dark-card dark:to-dark-surface border border-slate-200/80 dark:border-dark-border flex items-center justify-center group p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Subtle Decorative Aura */}
        <div className="absolute inset-0 bg-radial from-primary/5 via-transparent to-transparent opacity-70 pointer-events-none" />

        <img
          src={mainImage || "/images/no-image.png"}
          alt={productName}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 p-3 mix-blend-multiply dark:mix-blend-normal cursor-pointer z-10"
          onClick={() => setIsLightboxOpen(true)}
        />

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-rose-600 via-red-600 to-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-md uppercase tracking-wider pointer-events-none flex items-center gap-1">
            <span>⚡ Tiết Kiệm {discountPercent}%</span>
          </div>
        )}

        {/* Lightbox Trigger Button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 z-20 size-10 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-700 dark:text-slate-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-md border border-slate-200/60 dark:border-dark-border cursor-pointer"
          title="Xem ảnh phóng to toàn cảnh"
        >
          <FiMaximize2 size={16} />
        </button>

        {/* Quick Prev / Next overlay arrows on hover */}
        {displayImages && displayImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xs text-slate-700 dark:text-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-sm border border-slate-200/60 dark:border-dark-border cursor-pointer"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xs text-slate-700 dark:text-slate-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-sm border border-slate-200/60 dark:border-dark-border cursor-pointer"
            >
              <FiChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {displayImages && displayImages.length > 0 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {displayImages.map((img, idx) => {
            const isActive = mainImage === img.imageUrl;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setMainImage(img.imageUrl)}
                className={`flex-shrink-0 size-16 rounded-2xl border-2 overflow-hidden transition-all p-1 bg-white dark:bg-dark-card cursor-pointer ${
                  isActive
                    ? "border-primary scale-105 shadow-md shadow-primary/20 ring-2 ring-primary/20"
                    : "border-slate-200/70 dark:border-dark-border opacity-70 hover:opacity-100 hover:border-slate-300"
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain rounded-xl mix-blend-multiply dark:mix-blend-normal"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Mini Trust Bar (An Tâm Mua Sắm Ngay Dưới Ảnh) */}
      <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-dark-card/50 border border-slate-100 dark:border-dark-border space-y-2">
        <div className="text-[11px] font-bold text-slate-700 dark:text-dark-text-secondary flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-900 dark:text-white font-extrabold">
            <FiShield className="text-emerald-500" /> Cam Kết Khách Hàng
          </span>
          <span className="text-[10px] text-primary dark:text-primary-light">
            TIENTECH An Tâm
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 truncate">
            <FiCheckCircle className="size-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">Đồng kiểm khi nhận hàng</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <FiPackage className="size-3.5 text-primary shrink-0" />
            <span className="truncate">Đóng gói chuẩn phong thủy</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/94 backdrop-blur-xl flex items-center justify-center p-4 select-none"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
              className="absolute top-5 right-5 z-[100000] size-12 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-2xl"
              title="Đóng (Esc)"
            >
              <FiX size={26} />
            </button>

            {/* Navigation Left/Right Buttons */}
            {displayImages && displayImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-4 sm:left-8 z-[100000] size-12 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
                  title="Ảnh trước"
                >
                  <FiChevronLeft size={28} />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-4 sm:right-8 z-[100000] size-12 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
                  title="Ảnh tiếp"
                >
                  <FiChevronRight size={28} />
                </button>
              </>
            )}

            {/* Main Image Container */}
            <Motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-5xl max-h-[85vh] flex items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={mainImage || "/images/no-image.png"}
                alt={productName}
                className="max-w-full max-h-[80vh] object-contain drop-shadow-2xl"
              />
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(ImageGallery);
