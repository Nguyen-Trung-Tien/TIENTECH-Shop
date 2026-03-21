const db = require("../models");

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
          attributes: ["id", "name", "price", "image", "discount"],
        },
        {
          model: db.ProductVariant,
          as: "variant",
          attributes: ["id", "sku", "price", "stock", ["attributeValues", "attributes"], "imageUrl"],
        },
      ],
      limit,
      offset,
      order: [["id", "DESC"]], // Show newest first
    });

    return { items, total };
  } catch (error) {
    console.error("Error fetching cart items:", error);
    throw new Error("Error fetching cart items");
  }
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

  return await db.CartItem.findByPk(cartItem.id, {
    include: [
      { model: db.Product, as: "product" },
      { model: db.ProductVariant, as: "variant" },
    ],
  });
};

const updateCartItem = async (id, data, userId) => {
  const cartItem = await db.CartItem.findOne({
    where: { id },
    include: [{ model: db.Cart, as: "cart", where: { userId } }],
  });
  if (!cartItem) throw new Error("CartItem not found");
  return await cartItem.update(data);
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
  createCartItem,
  updateCartItem,
  deleteCartItem,
};
