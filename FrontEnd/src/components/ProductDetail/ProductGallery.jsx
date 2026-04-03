import React, { useState, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const ProductGallery = ({ images = [], primaryImage, discount }) => {
  const gallery = Array.from(
    new Set([...images.map((i) => i.imageUrl), primaryImage].filter(Boolean)),
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (primaryImage) {
      const idx = gallery.findIndex((u) => u === primaryImage);
      if (idx !== -1) setCurrentIndex(idx);
    }
  }, [primaryImage, gallery]);

  const goNext = () => setCurrentIndex((prev) => (prev + 1) % gallery.length);
  const goPrev = () =>
    setCurrentIndex((prev) => (prev - 1 + gallery.length) % gallery.length);

  if (!gallery.length) return null;

  return (
    <div className="space-y-6">
      {/* Main Image Container */}
      <div className="relative aspect-square rounded-[32px] bg-white shadow-soft border border-slate-100 overflow-hidden flex items-center justify-center p-8 group">
        <AnimatePresence mode="wait">
          <Motion.img
            key={gallery[currentIndex]}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            src={gallery[currentIndex]}
            alt="Product visual"
            className="max-h-full max-w-full object-contain"
          />
        </AnimatePresence>

        {gallery.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/90 backdrop-blur shadow-md flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-90"
              aria-label="Previous image"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-white/90 backdrop-blur shadow-md flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-all hover:bg-white active:scale-90"
              aria-label="Next image"
            >
              <FiChevronRight size={20} />
            </button>
          </>
        )}

        {discount > 0 && (
          <div className="absolute top-6 left-6">
            <span className="bg-brand text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg shadow-brand/20">
              -{discount}%
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="flex flex-wrap gap-3 justify-center">
          {gallery.map((url, idx) => (
            <button
              key={`${url}-${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 transition-all p-2 bg-white ${
                currentIndex === idx
                  ? "border-primary shadow-md"
                  : "border-transparent opacity-50 hover:opacity-100 hover:border-slate-200"
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductGallery);
