import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiShoppingCart, FiCreditCard, FiAlertCircle } from "react-icons/fi";
import { useProductVariants } from "../../hooks/useProductVariants";
import { Button } from "../UI/Button";

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

    if (displayVariant && product.images) {
      const variantImg = product.images.find(
        (img) => img.variantId === displayVariant.id
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

  // Format label string for currently selected variant combination
  const selectedVariantLabel = selectedVariant
    ? Object.entries(selectedVariant.attributes || selectedVariant.attributeValues || {})
        .map(([k, v]) => (typeof v === "object" ? v.value : v))
        .join(" / ")
    : Object.values(selectedAttributes).filter(Boolean).join(" / ");

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
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
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative w-full max-w-lg bg-white dark:bg-dark-surface rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 dark:border-dark-border transition-colors duration-300 max-h-[90vh] flex flex-col"
        >
          {/* Mobile Drag Pill */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden bg-slate-50/80 dark:bg-slate-950/60">
            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700 transition-all z-10 cursor-pointer"
          >
            <FiX size={18} />
          </button>

          <div className="p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar space-y-6">
            {/* Header Product Info */}
            <div className="flex gap-5">
              <div className="size-24 rounded-2xl bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border p-2 overflow-hidden flex-shrink-0 shadow-sm">
                <img
                  src={displayImage}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {Number(currentPrice).toLocaleString("vi-VN")} ₫
                  </span>
                  {Number(originalPrice) > Number(currentPrice) && (
                    <span className="text-xs text-slate-400 dark:text-dark-text-secondary line-through">
                      {Number(originalPrice).toLocaleString("vi-VN")} ₫
                    </span>
                  )}
                </div>
                {selectedVariant && (
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    ✓ Còn {selectedVariant.stock} sản phẩm
                  </p>
                )}
              </div>
            </div>

            {/* Selection Areas */}
            <div className="space-y-5 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar border-t border-slate-100 dark:border-dark-border pt-4">
              {Object.entries(allAttributes).map(([attrName, values]) => (
                <div key={attrName} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-dark-text-secondary">
                      Chọn {attrName}:
                    </label>
                    {selectedAttributes[attrName] && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px] border border-indigo-100 dark:border-indigo-900/40">
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
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => onSelectAttribute(attrName, val)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 flex items-center justify-center gap-2 cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                              : isAvailable
                              ? "bg-white dark:bg-dark-bg border-slate-200 dark:border-dark-border hover:border-indigo-400 text-slate-700 dark:text-dark-text-primary"
                              : "bg-slate-100 dark:bg-dark-bg border-slate-200 dark:border-dark-border text-slate-300 dark:text-dark-text-secondary/40 cursor-not-allowed opacity-50"
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

            {/* Selected Variant Summary Banner */}
            {selectedVariant ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="size-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    ✓
                  </span>
                  <span className="truncate">
                    Đã chọn: <strong className="text-slate-900 dark:text-white font-black">{selectedVariantLabel}</strong>
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-md text-[10px] uppercase font-black shrink-0">
                  Kho: {selectedVariant.stock}
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
                <FiAlertCircle className="text-amber-600 shrink-0 text-base" />
                <span>
                  {selectedVariantLabel
                    ? `Đang chọn: ${selectedVariantLabel} (Vui lòng chọn thêm thuộc tính)`
                    : "Vui lòng chọn đầy đủ các tùy chọn biến thể bên trên"}
                </span>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-dark-border space-y-3">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-2xl font-black text-xs tracking-wider border-2 dark:border-dark-border dark:text-dark-text-primary cursor-pointer"
                  disabled={product.variants?.length > 0 && !selectedVariant}
                  onClick={() => onAdd(selectedVariant?.id || product.id, true)}
                >
                  <FiShoppingCart className="mr-2" />
                  THÊM GIỎ HÀNG
                </Button>
                <Button
                  variant="default"
                  className="flex-[1.5] h-12 rounded-2xl font-black text-xs tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none cursor-pointer"
                  disabled={product.variants?.length > 0 && !selectedVariant}
                  onClick={() => onBuyNow(selectedVariant?.id || product.id, true)}
                >
                  <FiCreditCard className="mr-2" />
                  MUA NGAY
                </Button>
              </div>
            </div>
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuickVariantModal;
