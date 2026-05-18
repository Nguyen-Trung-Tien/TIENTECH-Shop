import React from "react";

const ImageGallery = ({ mainImage, setMainImage, displayImages, discountPercent, productName }) => {
  return (
    <div className="lg:col-span-5 space-y-4">
      <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border flex items-center justify-center relative group">
        <img
          src={mainImage || "/images/no-image.png"}
          alt={productName}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 p-4 dark:mix-blend-normal"
        />
        {discountPercent > 0 && (
          <div className="absolute top-4 left-4 bg-red-500 text-white text-[11px] font-bold px-2 py-1 rounded-lg shadow-sm">
            -{discountPercent}%
          </div>
        )}
      </div>
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {displayImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setMainImage(img.imageUrl)}
            className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${
              mainImage === img.imageUrl
                ? "border-blue-500 scale-95 shadow-sm"
                : "border-transparent dark:border-dark-border opacity-60 hover:opacity-100"
            }`}
          >
            <img
              src={img.imageUrl}
              alt=""
              className="w-full h-full object-cover dark:mix-blend-normal"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ImageGallery);
