const db = require("../models");

const isFlashSaleActive = (product) => {
  if (!product || !product.isFlashSale) return false;
  if (!product.flashSaleStart || !product.flashSaleEnd) return false;

  const now = new Date();
  const start = new Date(product.flashSaleStart);
  const end = new Date(product.flashSaleEnd);
  return now >= start && now <= end;
};

const calculateFinalPrice = (product, variant) => {
  if (!product) return 0;

  // ƯU TIÊN 1: Nếu sản phẩm đang Flash Sale, lấy giá Flash Sale
  if (isFlashSaleActive(product) && product.flashSalePrice) {
    return Number(product.flashSalePrice);
  }

  // ƯU TIÊN 2: Nếu có variant, lấy giá của variant (có thể có discount riêng)
  if (variant) {
    const price = Number(variant.price || 0);
    const discount = Number(variant.discount || 0);
    return Number((price * (1 - discount / 100)).toFixed(2));
  }

  // ƯU TIÊN 3: Giá gốc của sản phẩm
  return Number(product.basePrice || 0);
};

const getAllCartItems = async (userId, { limit, offset }) => {
  try {
    const total = await db.CartItem.count({
      include: [{ model: db.Cart, as: "cart", where: { userId } }],
    });

    const items = await db.CartItem.findAll({
      include: [
        {
          model: db.Cart,
          as: "cart",
          where: { userId },
          attributes: ["id"],
        },
        {
          model: db.Product,
          as: "product",
          attributes: ["id", "name", "basePrice", "isFlashSale", "flashSalePrice", "flashSaleStart", "flashSaleEnd", "totalStock", "isActive"],
          include: [
            {
              model: db.ProductImage,
              as: "images",
              attributes: ["imageUrl", "isPrimary"],
            },
          ],
        },
        {
          model: db.ProductVariant,
          as: "variant",
          attributes: ["id", "sku", "price", "stock", "attributeValues", "discount", "salePrice", "isActive"],
          include: [
            {
              model: db.ProductImage,
              as: "images",
              attributes: ["imageUrl", "isPrimary"],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["id", "DESC"]], // Show newest first
    });

    // Map to maintain compatibility with frontend expectations
    const mappedItems = items.map((item) => {
      const plainItem = item.get({ plain: true });
      
      if (plainItem.product) {
        // Find primary image or first image
        const primaryImage = plainItem.product.images?.find(img => img.isPrimary) || plainItem.product.images?.[0];
        plainItem.product.image = primaryImage ? primaryImage.imageUrl : null;
        plainItem.product.price = plainItem.product.basePrice;
      }

      if (plainItem.variant) {
        // Find variant image or product primary image
        const variantImage = plainItem.variant.images?.[0] || plainItem.product?.images?.find(img => img.isPrimary) || plainItem.product?.images?.[0];
        plainItem.variant.imageUrl = variantImage ? variantImage.imageUrl : null;
        plainItem.variant.attributes = plainItem.variant.attributeValues;
      }

      // Add real-time price info
      const isFS = isFlashSaleActive(plainItem.product);
      plainItem.isFlashSaleActive = isFS; 
      plainItem.finalPrice = calculateFinalPrice(plainItem.product, plainItem.variant);
      plainItem.flashSaleEnd = plainItem.product?.flashSaleEnd;
      
      if (isFS) {
          const original = Number(plainItem.product.basePrice || 0);
          const sale = Number(plainItem.product.flashSalePrice || 0);
          plainItem.flashSaleDiscount = original > 0 ? Math.round(((original - sale) / original) * 100) : 0;
      }

      return plainItem;
    });

    return { items: mappedItems, total };
  } catch (error) {
    console.error("Error fetching cart items:", error);
    throw new Error("Error fetching cart items");
  }
};

const getCartItemById = async (id, userId) => {
  const item = await db.CartItem.findOne({
    where: { id },
    include: [
      {
        model: db.Cart,
        as: "cart",
        where: { userId },
        attributes: ["id"],
      },
      {
        model: db.Product,
        as: "product",
        attributes: ["id", "name", "basePrice", "isFlashSale", "flashSalePrice", "flashSaleStart", "flashSaleEnd", "totalStock", "isActive"],
        include: [{ model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] }],
      },
      {
        model: db.ProductVariant,
        as: "variant",
        attributes: ["id", "sku", "price", "stock", "attributeValues", "discount", "salePrice", "isActive"],
        include: [{ model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] }],
      },
    ],
  });

  if (!item) return null;

  const plainItem = item.get({ plain: true });
  if (plainItem.product) {
    const primaryImage = plainItem.product.images?.find(img => img.isPrimary) || plainItem.product.images?.[0];
    plainItem.product.image = primaryImage ? primaryImage.imageUrl : null;
    plainItem.product.price = plainItem.product.basePrice;
  }
  if (plainItem.variant) {
    const variantImage = plainItem.variant.images?.[0] || plainItem.product?.images?.find(img => img.isPrimary) || plainItem.product?.images?.[0];
    plainItem.variant.imageUrl = variantImage ? variantImage.imageUrl : null;
    plainItem.variant.attributes = plainItem.variant.attributeValues;
  }
  
  const isFS = isFlashSaleActive(plainItem.product);
  plainItem.isFlashSaleActive = isFS && !plainItem.variant;
  plainItem.finalPrice = calculateFinalPrice(plainItem.product, plainItem.variant);
  
  if (plainItem.isFlashSaleActive) {
      const original = Number(plainItem.product.basePrice || 0);
      const sale = Number(plainItem.product.flashSalePrice || 0);
      plainItem.flashSaleDiscount = original > 0 ? Math.round(((original - sale) / original) * 100) : 0;
  }
  
  return plainItem;
};

const createCartItem = async ({ cartId, productId, variantId, quantity }, userId) => {
  if (!cartId || !productId) throw new Error("cartId and productId are required");
  if (!quantity || quantity < 1) throw new Error("quantity must be at least 1");

  const cart = await db.Cart.findOne({ where: { id: cartId, userId } });
  if (!cart) throw new Error("Cart not found or not yours");

  const product = await db.Product.findByPk(productId);
  if (!product) throw new Error("Product not found");

  let variant = null;
  if (variantId) {
    variant = await db.ProductVariant.findOne({ where: { id: variantId, productId } });
    if (!variant) throw new Error("Variant not found for this product");
  }

  // Check if item with SAME productId and SAME variantId exists
  const where = { cartId, productId };
  if (variantId) {
    where.variantId = variantId;
  } else {
    // If no variantId provided, explicitly look for item with variantId = null
    where.variantId = null;
  }

  let cartItem = await db.CartItem.findOne({ where });

  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    cartItem = await db.CartItem.create({ cartId, productId, variantId, quantity });
  }

  return await getCartItemById(cartItem.id, userId);
};

const updateCartItem = async (id, data, userId) => {
  const cartItem = await db.CartItem.findOne({
    where: { id },
    include: [{ model: db.Cart, as: "cart", where: { userId } }],
  });
  if (!cartItem) throw new Error("CartItem not found");
  await cartItem.update(data);
  return await getCartItemById(id, userId);
};

const deleteCartItem = async (id, userId) => {
  const cartItem = await db.CartItem.findOne({
    where: { id },
    include: [{ model: db.Cart, as: "cart", where: { userId } }],
  });
  if (!cartItem) throw new Error("CartItem not found");
  await cartItem.destroy();
  return true;
};

module.exports = {
  getAllCartItems,
  getCartItemById,
  createCartItem,
  updateCartItem,
  deleteCartItem,
};
