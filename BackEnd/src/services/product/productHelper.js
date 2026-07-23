const db = require("../../models");
const { Op } = require("sequelize");
const { deleteCacheByPattern } = require("../../config/redis");
const { slugify } = require("../../utils/slugHelper");
const { generateEmbedding } = require("../../utils/embeddingHelper");

const prepareProductEmbeddingText = (product) => {
  const specs =
    typeof product.specifications === "string"
      ? product.specifications
      : JSON.stringify(product.specifications || {});
  return `Sản phẩm: ${product.name}. Mô tả: ${product.description || ""}. Thông số: ${specs}`.slice(
    0,
    8000,
  );
};

const updateProductEmbedding = async (product, transaction) => {
  try {
    const text = prepareProductEmbeddingText(product);
    const embedding = await generateEmbedding(text);
    if (embedding) {
      await product.update(
        { embedding: JSON.stringify(embedding) },
        { transaction },
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Lỗi cập nhật embedding cho SP ${product.id}:`, error);
    return false;
  }
};

const ensureUniqueSKU = async (sku, transaction) => {
  if (!sku) return `PROD-${Date.now()}`;
  const existing = await db.Product.findOne({
    where: { sku: { [Op.like]: sku } },
    transaction,
  });
  if (existing) return `${sku}-${Date.now()}`;
  return sku;
};

const clearProductCache = async (categoryId = null) => {
  await deleteCacheByPattern("products_*");
  await deleteCacheByPattern("dashboard_*");
  await deleteCacheByPattern("smart_recs_*");
  await deleteCacheByPattern("user_recs_*");
};

const isFlashSaleActive = (product) => {
  if (!product || !product.isFlashSale) return false;
  if (!product.flashSaleStart || !product.flashSaleEnd) return false;

  const now = new Date();
  const start = new Date(product.flashSaleStart);
  const end = new Date(product.flashSaleEnd);
  return now >= start && now <= end;
};

const applyFlashSaleToProduct = (productData) => {
  const product = { ...productData };
  const originalPrice = Number(product.basePrice || product.price || 0);
  product.basePrice = originalPrice;
  product.originalPrice = originalPrice;
  product.flashSaleActive = isFlashSaleActive(product);

  if (product.flashSaleActive && product.flashSalePrice) {
    // Flash Sale đang active: dùng giá flash sale
    const salePrice = Number(product.flashSalePrice);
    product.displayPrice = salePrice;
    product.price = salePrice;
    product.flashSaleDiscount =
      originalPrice > 0
        ? ((originalPrice - salePrice) / originalPrice) * 100
        : 0;
    product.discountPercent = Math.round(product.flashSaleDiscount);
  } else {
    // Không có flash sale: áp dụng discount % thông thường
    product.flashSaleDiscount = 0;
    const discountPct = Number(product.discount || 0);
    if (discountPct > 0 && originalPrice > 0) {
      const discountedPrice = originalPrice * (1 - discountPct / 100);
      product.displayPrice = discountedPrice;
      product.price = discountedPrice;
    } else {
      product.displayPrice = originalPrice;
      product.price = originalPrice;
    }
    product.discountPercent = discountPct;
  }

  // Thêm object flashSale đồng bộ cho Frontend (ví dụ ProductDetailPage)
  product.flashSale = {
    isActive: product.flashSaleActive,
    price: product.flashSaleActive ? Number(product.flashSalePrice || 0) : 0,
    startDate: product.flashSaleStart || null,
    endDate: product.flashSaleEnd || null,
    discount: product.flashSaleDiscount,
  };

  return product;
};


module.exports = {
  prepareProductEmbeddingText,
  updateProductEmbedding,
  ensureUniqueSKU,
  clearProductCache,
  isFlashSaleActive,
  applyFlashSaleToProduct,
};
