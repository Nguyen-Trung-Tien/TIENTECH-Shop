const db = require("../../models");
const { calculateFinalPrice } = require("../../utils/priceHelper");

const getAllCarts = async (userId) => {
  try {
    return await db.Cart.findAll({
      where: { userId },
      include: [
        { model: db.User, as: "user", attributes: ["id", "username", "email"] },
        { model: db.CartItem, as: "cartItems" },
      ],
    });
  } catch (error) {
    throw new Error("Error from server");
  }
};

const getCartById = async (id, userId) => {
  try {
    const cart = await db.Cart.findOne({
      where: { id, userId },
      include: [
        { model: db.User, as: "user", attributes: ["id", "username", "email"] },
        { model: db.CartItem, as: "cartItems" },
      ],
    });
    if (!cart) throw new Error("Cart not found");
    return cart;
  } catch (error) {
    throw new Error(error.message || "Error from server");
  }
};

const createCart = async (userId) => {
  try {
    return await db.Cart.create({ userId });
  } catch (error) {
    throw new Error("Error from server");
  }
};

const updateCart = async (id, data, userId) => {
  try {
    const cart = await db.Cart.findOne({ where: { id, userId } });
    if (!cart) throw new Error("Cart not found or not yours");
    const { id: _id, userId: _userId, ...safeData } = data || {};
    return await cart.update(safeData);
  } catch (error) {
    throw new Error(error.message || "Error from server");
  }
};

const deleteCart = async (id, userId) => {
  try {
    const cart = await db.Cart.findOne({ where: { id, userId } });
    if (!cart) throw new Error("Cart not found or not yours");
    await cart.destroy();
    return true;
  } catch (error) {
    throw new Error(error.message || "Error from server");
  }
};

const validateCart = async (userId, items) => {
  try {
    if (!Array.isArray(items)) {
      return { errCode: 1, errMessage: "Danh sách sản phẩm không hợp lệ." };
    }

    const validatedItems = [];
    let hasChanged = false;
    let totalAmount = 0;

    for (const item of items) {
      const product = await db.Product.findByPk(item.productId, {
        include: [{ model: db.ProductImage, as: "images", attributes: ["imageUrl", "isPrimary"] }]
      });

      if (!product || !product.isActive) {
        hasChanged = true;
        validatedItems.push({
          ...item,
          status: "unavailable",
          message: "Sản phẩm không còn tồn tại hoặc đã ngừng kinh doanh",
        });
        continue;
      }

      if (product.hasVariants && !item.variantId) {
        hasChanged = true;
        validatedItems.push({
          ...item,
          status: "unavailable",
          message: "Vui lòng chọn phiên bản sản phẩm hợp lệ",
        });
        continue;
      }

      let variant = null;
      if (item.variantId) {
        variant = await db.ProductVariant.findOne({
          where: { id: item.variantId, productId: product.id },
        });
        if (!variant || !variant.isActive) {
          hasChanged = true;
          validatedItems.push({
            ...item,
            status: "unavailable",
            message: "Phiên bản sản phẩm không còn khả dụng",
          });
          continue;
        }
      }

      // Check Stock
      const availableStock = variant ? variant.stock : product.totalStock;
      let finalQuantity = item.quantity;
      let stockMessage = null;

      if (availableStock <= 0) {
        hasChanged = true;
        validatedItems.push({
          ...item,
          status: "out_of_stock",
          message: "Sản phẩm đã hết hàng",
        });
        continue;
      }

      if (finalQuantity > availableStock) {
        hasChanged = true;
        finalQuantity = availableStock;
        stockMessage = `Chỉ còn ${availableStock} sản phẩm trong kho`;
      }

      // Price logic (supports multi-variant Flash Sale ratio)
      const unitPrice = calculateFinalPrice(product, variant);

      const currentItemPrice = Number(item.price || item.finalPrice || 0);
      const isPriceMismatched = Math.abs(currentItemPrice - unitPrice) > 1;

      if (isPriceMismatched) {
        hasChanged = true;
        console.log(`[CartValidation] Price mismatch for ${product.name}: Client=${currentItemPrice}, Server=${unitPrice}`);
      }

      const subtotal = Number((unitPrice * finalQuantity).toFixed(2));
      totalAmount += subtotal;

      const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];

      validatedItems.push({
        ...item,
        productName: product.name,
        image: primaryImage?.imageUrl || item.image,
        quantity: finalQuantity,
        price: unitPrice,
        subtotal,
        status: stockMessage ? "adjusted" : "ok",
        message: stockMessage,
      });
    }

    return {
      errCode: 0,
      data: {
        items: validatedItems,
        hasChanged,
        totalAmount,
      },
    };
  } catch (error) {
    console.error("CartService.validateCart error:", error);
    return { errCode: -1, errMessage: error.message };
  }
};

module.exports = {
  getAllCarts,
  getCartById,
  createCart,
  updateCart,
  deleteCart,
  validateCart,
};
