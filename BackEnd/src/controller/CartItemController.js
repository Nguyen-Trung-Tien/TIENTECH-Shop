const CartItemService = require("../services/CartItemService");

const getAllCartItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { items, total } = await CartItemService.getAllCartItems(
      req.user.id,
      { limit, offset }
    );

    res.status(200).json({
      errCode: 0,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ errCode: 1, errMessage: err.message });
  }
};

const getCartItemById = async (req, res) => {
  try {
    const item = await CartItemService.getCartItemById(
      req.params.id,
      req.user.id
    );
    res.status(200).json({ errCode: 0, data: item });
  } catch (err) {
    res.status(404).json({ errCode: 1, errMessage: err.message });
  }
};

const createCartItem = async (req, res) => {
  try {
    const { cartId, productId, variantId, quantity } = req.body;
    const newItem = await CartItemService.createCartItem(
      { cartId, productId, variantId, quantity },
      req.user.id
    );
    res.status(201).json({ errCode: 0, data: newItem });
  } catch (err) {
    res.status(500).json({ errCode: 1, errMessage: err.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const updatedItem = await CartItemService.updateCartItem(
      req.params.id,
      req.body,
      req.user.id
    );
    res.status(200).json({ errCode: 0, data: updatedItem });
  } catch (err) {
    res.status(404).json({ errCode: 1, errMessage: err.message });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    await CartItemService.deleteCartItem(req.params.id, req.user.id);
    res.status(200).json({ errCode: 0, message: "CartItem deleted" });
  } catch (err) {
    res.status(404).json({ errCode: 1, errMessage: err.message });
  }
};

module.exports = {
  getAllCartItems,
  getCartItemById,
  createCartItem,
  updateCartItem,
  deleteCartItem,
};
