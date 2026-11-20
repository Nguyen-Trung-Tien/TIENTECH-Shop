import React from "react";
import {
  FiCheck,
  FiShoppingCart,
  FiCreditCard,
  FiAlertCircle,
  FiZap,
} from "react-icons/fi";
import { useProductVariants } from "../../hooks/useProductVariants";
import { Modal, Button } from "../UI";
import {
  calculateDiscountPercent,
  calculateFinalPrice,
  calculateOriginalPrice,
  isFlashSaleActive,
} from "../../utils/priceHelper";

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

  const flashNormalizedProduct = {
    ...product,
    isFlashSale: Boolean(
      product?.flashSale?.isActive ??
      product?.flashSaleActive ??
      product?.isFlashSale,
    ),
    flashSalePrice: Number(
      product?.flashSale?.price ?? product?.flashSalePrice ?? 0,
    ),
    basePrice: Number(
      product?.originalPrice || product?.basePrice || product?.price || 0,
    ),
  };

  const isFlashSale = isFlashSaleActive(flashNormalizedProduct);
  const originalPrice = calculateOriginalPrice(
    flashNormalizedProduct,
    displayVariant,
  );
  const currentPrice =
    displayVariant &&
    !isFlashSale &&
    Number(displayVariant.salePrice) > 0 &&
    Number(displayVariant.salePrice) < originalPrice
      ? Number(displayVariant.salePrice)
      : calculateFinalPrice(flashNormalizedProduct, displayVariant);
  const variantDiscountPct =
    originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : calculateDiscountPercent(flashNormalizedProduct, displayVariant);

  // Format label string for currently selected variant combination
  const selectedVariantLabel = selectedVariant
    ? Object.entries(
        selectedVariant.attributes || selectedVariant.attributeValues || {},
      )
        .map(([k, v]) => (typeof v === "object" ? v.value : v))
        .join(" / ")
    : Object.values(selectedAttributes).filter(Boolean).join(" / ");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      bodyClassName="p-0"
    >
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
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                {product.name}
              </h3>
              {isFlashSale && (
                <span className="shrink-0 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-0.5 shadow-xs">
                  <FiZap className="fill-current size-2.5" /> FLASH SALE
                </span>
              )}
            </div>
            <div className="flex items-center flex-wrap gap-2 pt-1">
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                {Number(currentPrice).toLocaleString("vi-VN")} ₫
              </span>
              {Number(originalPrice) > Number(currentPrice) && (
                <span className="text-xs text-slate-400 dark:text-dark-text-secondary line-through">
                  {Number(originalPrice).toLocaleString("vi-VN")} ₫
                </span>
              )}
              {variantDiscountPct > 0 && (
                <span className="text-[10px] font-black text-white bg-rose-500 px-2 py-0.5 rounded-full shadow-sm">
                  -{variantDiscountPct}%
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
                  const isAvailable = checkAttributeAvailability(
                    attrName,
                    val,
                  );
                  return (
                    <button
                      key={val}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => onSelectAttribute(attrName, val)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 duration-200 border-2 flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none ring-2 ring-indigo-400/30"
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
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-sm transition-all duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <span className="size-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                ✓
              </span>
              <span className="truncate">
                Đã chọn:{" "}
                <strong className="text-slate-900 dark:text-white font-black">
                  {selectedVariantLabel}
                </strong>
              </span>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-md text-[10px] uppercase font-black shrink-0">
              Kho: {selectedVariant.stock}
            </span>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2 transition-all duration-200">
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
              className="flex-1 h-12 rounded-2xl font-black text-xs tracking-wider border-2 dark:border-dark-border dark:text-dark-text-primary cursor-pointer active:scale-95 transition-all duration-200"
              disabled={product.variants?.length > 0 && !selectedVariant}
              onClick={() =>
                onAdd(selectedVariant?.id || null, Boolean(selectedVariant))
              }
            >
              <FiShoppingCart className="mr-2" />
              THÊM GIỎ HÀNG
            </Button>
            <Button
              variant="default"
              className="flex-[1.5] h-12 rounded-2xl font-black text-xs tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none cursor-pointer active:scale-95 transition-all duration-200"
              disabled={product.variants?.length > 0 && !selectedVariant}
              onClick={() =>
                onBuyNow(
                  selectedVariant?.id || null,
                  Boolean(selectedVariant),
                )
              }
            >
              <FiCreditCard className="mr-2" />
              MUA NGAY
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuickVariantModal;
