import React, { useState } from "react";
import { FiMaximize2, FiX } from "react-icons/fi";

const ImageGallery = ({ mainImage, setMainImage, displayImages, discountPercent, productName }) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  return (
    <div className="lg:col-span-5 space-y-4">
      {/* Main Preview Container */}
      <div className="aspect-square rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center relative group p-6 shadow-sm">
        <img
          src={mainImage || "/images/no-image.png"}
          alt={productName}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-108 p-2 mix-blend-multiply dark:mix-blend-normal"
        />
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[11px] font-black px-3 py-1 rounded-xl shadow-md uppercase tracking-wider">
            ⚡ Tiết kiệm {discountPercent}%
          </div>
        )}

        {/* Lightbox Trigger Button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 size-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-700 dark:text-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-md border border-slate-200/60 dark:border-slate-700/60"
          title="Xem ảnh phóng to"
        >
          <FiMaximize2 size={16} />
        </button>
      </div>

      {/* Thumbnail Navigation */}
      {displayImages && displayImages.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {displayImages.map((img, idx) => {
            const isActive = mainImage === img.imageUrl;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setMainImage(img.imageUrl)}
                className={`flex-shrink-0 size-16 rounded-2xl border-2 overflow-hidden transition-all p-1 bg-white dark:bg-slate-900 cursor-pointer ${
                  isActive
                    ? "border-blue-600 dark:border-blue-400 scale-105 shadow-md shadow-blue-500/20"
                    : "border-slate-200/60 dark:border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-300"
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

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 size-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
          >
            <FiX size={24} />
          </button>
          <img
            src={mainImage}
            alt={productName}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(ImageGallery);
