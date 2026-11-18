export const GUEST_CART_STORAGE_KEY = "tientech_guest_cart";

const hasLocalStorage = () => {
  try {
    return typeof window !== "undefined" && Boolean(window.localStorage);
  } catch {
    return false;
  }
};

export const getGuestCartItemId = (productId, variantId = null) =>
  `guest_${productId}_${variantId || "base"}`;

export const loadGuestCart = () => {
  if (!hasLocalStorage()) return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && item.productId && item.product)
      : [];
  } catch {
    return [];
  }
};

export const saveGuestCart = (items) => {
  if (!hasLocalStorage()) return;
  try {
    const safeItems = Array.isArray(items) ? items : [];
    window.localStorage.setItem(
      GUEST_CART_STORAGE_KEY,
      JSON.stringify(safeItems),
    );
  } catch {
    // Ignore quota / security errors
  }
};

export const clearGuestCart = () => {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
};

export const buildGuestCartItem = ({
  product,
  variant = null,
  quantity = 1,
}) => {
  if (!product || !product.id) return null;
  const resolvedVariant =
    variant ||
    (product.variants && variant?.id
      ? product.variants.find((v) => Number(v.id) === Number(variant.id))
      : null);

  const variantId = resolvedVariant?.id || null;
  const qty = Math.max(1, Math.floor(Number(quantity) || 1));

  return {
    id: getGuestCartItemId(product.id, variantId),
    productId: product.id,
    variantId,
    quantity: qty,
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      basePrice: product.basePrice,
      discount: product.discount,
      stock: product.stock,
      totalStock: product.totalStock,
      hasVariants: product.hasVariants,
      isFlashSale: product.isFlashSale,
      flashSalePrice: product.flashSalePrice,
      flashSaleStart: product.flashSaleStart,
      flashSaleEnd: product.flashSaleEnd,
      variants: product.variants || [],
    },
    variant: resolvedVariant
      ? {
          id: resolvedVariant.id,
          sku: resolvedVariant.sku,
          name: resolvedVariant.name,
          price: resolvedVariant.price,
          discount: resolvedVariant.discount,
          stock: resolvedVariant.stock,
          image: resolvedVariant.image,
          attributes: resolvedVariant.attributes,
        }
      : null,
    isGuestItem: true,
  };
};

export const addOrMergeGuestCartItem = ({
  product,
  variant = null,
  quantity = 1,
  currentItems = null,
}) => {
  const newItem = buildGuestCartItem({ product, variant, quantity });
  if (!newItem) return currentItems || loadGuestCart();

  const items = [
    ...(Array.isArray(currentItems) ? currentItems : loadGuestCart()),
  ];
  const existingIdx = items.findIndex(
    (item) =>
      Number(item.productId) === Number(newItem.productId) &&
      (item.variantId || null) === (newItem.variantId || null),
  );

  const maxStock = Number(
    newItem.variant?.stock ??
      newItem.product?.totalStock ??
      newItem.product?.stock ??
      999,
  );

  if (existingIdx >= 0) {
    const existing = items[existingIdx];
    const nextQty = Math.min(
      Math.max(1, maxStock),
      (Number(existing.quantity) || 0) + newItem.quantity,
    );
    items[existingIdx] = {
      ...existing,
      quantity: nextQty,
      product: newItem.product,
      variant: newItem.variant,
    };
  } else {
    items.push({
      ...newItem,
      quantity: Math.min(Math.max(1, maxStock), newItem.quantity),
    });
  }

  saveGuestCart(items);
  return items;
};

export const updateGuestCartItemQty = (
  itemId,
  quantity,
  currentItems = null,
) => {
  const items = [
    ...(Array.isArray(currentItems) ? currentItems : loadGuestCart()),
  ];
  const nextQty = Math.max(1, Math.floor(Number(quantity) || 1));
  const updated = items.map((item) =>
    item.id === itemId ? { ...item, quantity: nextQty } : item,
  );
  saveGuestCart(updated);
  return updated;
};

export const removeGuestCartItemById = (itemIds, currentItems = null) => {
  const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
  const items = [
    ...(Array.isArray(currentItems) ? currentItems : loadGuestCart()),
  ];
  const updated = items.filter((item) => !ids.includes(item.id));
  saveGuestCart(updated);
  return updated;
};

let pendingGuestCartSyncPromise = null;

export const runGuestCartSync = (userId, syncFn) => {
  if (!userId || typeof syncFn !== "function") return Promise.resolve([]);
  if (pendingGuestCartSyncPromise) return pendingGuestCartSyncPromise;
  pendingGuestCartSyncPromise = Promise.resolve()
    .then(() => syncFn())
    .finally(() => {
      pendingGuestCartSyncPromise = null;
    });
  return pendingGuestCartSyncPromise;
};

export const waitForGuestCartSync = async () => {
  if (pendingGuestCartSyncPromise) {
    try {
      await pendingGuestCartSyncPromise;
    } catch {
      // Allow caller to continue safely even if background sync errored
    }
  }
};
