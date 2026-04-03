import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiShoppingCart, FiCreditCard } from "react-icons/fi";
import { useProductVariants } from "../../hooks/useProductVariants";
import Button from "../UI/Button";

const QuickVariantModal = ({ product, isOpen, onClose, onAdd, onBuyNow }) => {
  const {
    allAttributes,
    selectedAttributes,
    selectedVariant,
    displayVariant,
    onSelectAttribute,
    checkAttributeAvailability,
  } = useProductVariants(product, false);

  const displayImage = React.useMemo(() => {
    if (displayVariant?.imageUrl) return displayVariant.imageUrl;

    // Fallback to variant image from product.images if variantId matches
    if (displayVariant && product.images) {
      const variantImg = product.images.find(
        (img) => img.variantId === displayVariant.id,
      );
      if (variantImg) return variantImg.imageUrl;
    }

    if (product.image) return product.image;

    if (product.images && product.images.length > 0) {
      const primary =
        product.images.find((img) => img.isPrimary) || product.images[0];
      return primary.imageUrl;
    }

    return null;
  }, [displayVariant, product]);

  if (!isOpen) return null;

  const currentPrice = displayVariant
    ? Number(displayVariant.salePrice) > 0
      ? displayVariant.salePrice
      : displayVariant.price
    : product.displayPrice || product.basePrice || product.price;

  const originalPrice = displayVariant
    ? displayVariant.price
    : product.originalPrice || product.basePrice || product.price;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Overlay */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <Motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-dark-border"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all z-10"
          >
            <FiX size={20} />
          </button>

          <div className="p-6 md:p-8">
            <div className="flex gap-6 mb-8">
              <div className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border p-2 overflow-hidden flex-shrink-0">
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2 mb-2">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-primary">
                    {Number(currentPrice).toLocaleString("vi-VN")} ₫
                  </span>
                  {Number(originalPrice) > Number(currentPrice) && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                      {Number(originalPrice).toLocaleString("vi-VN")} ₫
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Selection Areas */}
            <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {Object.entries(allAttributes).map(([attrName, values]) => (
                <div key={attrName} className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Chọn {attrName}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {values.map((val) => {
                      const isSelected = selectedAttributes[attrName] === val;
                      const isAvailable = checkAttributeAvailability(
                        attrName,
                        val,
                      );
                      return (
                        <button
                          key={val}
                          disabled={!isAvailable}
                          onClick={() => onSelectAttribute(attrName, val)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 flex items-center justify-center gap-2 ${
                            isSelected
                              ? "bg-slate-900 dark:bg-primary border-slate-900 dark:border-primary text-white shadow-lg shadow-slate-200 dark:shadow-none"
                              : isAvailable
                                ? "bg-white dark:bg-dark-bg border-slate-100 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300"
                                : "bg-slate-50 dark:bg-dark-bg border-slate-50 dark:border-dark-border text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-60"
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

            {/* Footer Action */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-dark-border space-y-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-14 rounded-2xl font-black text-xs tracking-widest border-2"
                  disabled={product.variants?.length > 0 && !selectedVariant}
                  onClick={() => onAdd(selectedVariant?.id || product.id)}
                  icon={FiShoppingCart}
                >
                  THÊM GIỎ HÀNG
                </Button>
                <Button
                  variant="primary"
                  className="flex-[1.5] h-14 rounded-2xl font-black text-xs tracking-widest shadow-xl shadow-primary/20"
                  disabled={product.variants?.length > 0 && !selectedVariant}
                  onClick={() => onBuyNow(selectedVariant?.id || product.id)}
                  icon={FiCreditCard}
                >
                  MUA NGAY
                </Button>
              </div>

              {product.variants?.length > 0 && !selectedVariant && (
                <p className="text-center text-danger text-[10px] font-bold uppercase mt-3 tracking-widest">
                  Vui lòng chọn đầy đủ các tùy chọn
                </p>
              )}
            </div>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickVariantModal;
