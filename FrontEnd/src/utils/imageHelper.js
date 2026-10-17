/**
 * Tiện ích xử lý hình ảnh và ảnh dự phòng (fallback placeholder) an toàn
 * Ngăn ngừa triệt để lỗi 404 và vỡ layout hình ảnh trên toàn hệ thống
 */

// SVG Placeholder Data URI siêu nhẹ, tương thích Dark Mode và không phụ thuộc network
export const DEFAULT_PRODUCT_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'%3E%3Crect width='200' height='200' rx='24' fill='%23f1f5f9'/%3E%3Cpath d='M65 72l35-20 35 20v40l-35 20-35-20V72z' fill='none' stroke='%2394a3b8' stroke-width='6' stroke-linejoin='round'/%3E%3Cpath d='M100 52v40M65 72l35 20 35-20' fill='none' stroke='%2394a3b8' stroke-width='6' stroke-linejoin='round'/%3E%3C/svg%3E";

/**
 * Trích xuất URL hình ảnh từ nhiều cấu trúc dữ liệu khác nhau (Product, Variant, OrderItem, v.v.)
 * @param {object|string} source Đối tượng chứa thông tin ảnh hoặc đường dẫn ảnh
 * @returns {string} URL hợp lệ hoặc placeholder
 */
export const getProductImage = (source) => {
  if (!source) return DEFAULT_PRODUCT_IMAGE;

  if (typeof source === "string") {
    const trimmed = source.trim();
    return trimmed ? trimmed : DEFAULT_PRODUCT_IMAGE;
  }

  // 1. Trường image trực tiếp (OrderItem.image hoặc Product.image)
  if (source.image && typeof source.image === "string") {
    return source.image.trim();
  }

  // 2. Mảng images lồng bên trong (ProductImages)
  if (Array.isArray(source.images) && source.images.length > 0) {
    const primary = source.images.find((img) => img?.isPrimary);
    const candidate = primary?.imageUrl || source.images[0]?.imageUrl || source.images[0];
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  // 3. Đối tượng product lồng bên trong OrderItem (source.product / source.productInfo)
  const nestedProduct = source.product || source.productInfo;
  if (nestedProduct) {
    const nestedResult = getProductImage(nestedProduct);
    if (nestedResult !== DEFAULT_PRODUCT_IMAGE) {
      return nestedResult;
    }
  }

  // 4. Đối tượng variant lồng bên trong
  if (source.variant) {
    const variantResult = getProductImage(source.variant);
    if (variantResult !== DEFAULT_PRODUCT_IMAGE) {
      return variantResult;
    }
  }

  // 5. Trường avatar hoặc thumbnail
  if (typeof source.avatar === "string" && source.avatar.trim()) {
    return source.avatar.trim();
  }
  if (typeof source.thumbnail === "string" && source.thumbnail.trim()) {
    return source.thumbnail.trim();
  }

  return DEFAULT_PRODUCT_IMAGE;
};

/**
 * Handler bắt lỗi tải ảnh và thay thế bằng ảnh dự phòng an toàn
 * @param {React.SyntheticEvent<HTMLImageElement, Event>} e
 */
export const handleImageError = (e) => {
  if (!e || !e.currentTarget) return;
  e.currentTarget.onerror = null;
  e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
};
