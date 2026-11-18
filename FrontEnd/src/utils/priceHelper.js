export const isFlashSaleActive = (product) => {
  if (!product || !product.isFlashSale) return false;
  if (!product.flashSaleStart && !product.flashSaleEnd) return true;

  const now = new Date();
  const start = product.flashSaleStart ? new Date(product.flashSaleStart) : null;
  const end = product.flashSaleEnd ? new Date(product.flashSaleEnd) : null;

  if (start && now < start) return false;
  if (end && now > end) return false;

  return true;
};

export const calculateFlashSaleRatio = (product) => {
  if (!product) return 1;
  const basePrice = Number(product.basePrice || 0);
  const flashSalePrice = Number(product.flashSalePrice || 0);
  if (basePrice > 0 && flashSalePrice > 0) {
    return flashSalePrice / basePrice;
  }
  return 1;
};

export const calculateOriginalPrice = (product, variant = null) => {
  if (!product) return 0;
  if (variant) {
    return Number(variant.price || product.basePrice || 0);
  }
  return Number(product.basePrice || product.price || 0);
};

export const calculateFinalPrice = (product, variant = null) => {
  if (!product) return 0;

  const basePrice = Number(product.basePrice || product.price || 0);
  const flashActive =
    isFlashSaleActive(product) && Number(product.flashSalePrice || 0) > 0;

  if (flashActive) {
    const flashSalePrice = Number(product.flashSalePrice);
    if (variant) {
      const variantPrice = Number(variant.price || 0);
      if (basePrice > 0 && variantPrice > 0) {
        const ratio = flashSalePrice / basePrice;
        return Math.round(variantPrice * ratio);
      }
      return Math.round(flashSalePrice);
    }
    return Math.round(flashSalePrice);
  }

  if (variant) {
    const originalPrice = Number(variant.price || 0);
    const discount =
      Number(variant.discount || 0) || Number(product.discount || 0);
    return Math.round(
      discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice,
    );
  }

  const discount = Number(product.discount || 0);
  return Math.round(
    discount > 0 ? basePrice * (1 - discount / 100) : basePrice,
  );
};

export const calculateDiscountPercent = (product, variant = null) => {
  const original = calculateOriginalPrice(product, variant);
  const final = calculateFinalPrice(product, variant);
  if (original <= 0 || final >= original) return 0;
  return Math.round(((original - final) / original) * 100);
};
