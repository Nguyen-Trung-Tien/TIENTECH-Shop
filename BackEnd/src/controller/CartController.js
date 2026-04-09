const CartService = require("../services/CartService");

const getAllCarts = async (req, res) => {
  try {
    const carts = await CartService.getAllCarts(req.user.id);
    res.status(200).json({ errCode: 0, data: carts });
  } catch (err) {
    res.status(500).json({ errCode: 1, errMessage: err.message });
  }
};

const getCartById = async (req, res) => {
  try {
    const cart = await CartService.getCartById(req.params.id, req.user.id);
    res.status(200).json({ errCode: 0, data: cart });
  } catch (err) {
    res.status(404).json({ errCode: 1, errMessage: err.message });
  }
};

const createCart = async (req, res) => {
  try {
    const newCart = await CartService.createCart(req.user.id);
    res.status(201).json({ errCode: 0, data: newCart });
  } catch (err) {
    res.status(500).json({ errCode: 1, errMessage: err.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const updatedCart = await CartService.updateCart(
      req.params.id,
      req.body,
      req.user.id
    );
    res.status(200).json({ errCode: 0, data: updatedCart });
  } catch (err) {
    res.status(404).json({ errCode: 1, errMessage: err.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    await CartService.deleteCart(req.params.id, req.user.id);
    res.status(200).json({ errCode: 0, message: "Cart deleted" });
  } catch (err) {
    res.status(404).json({ errCode: 1, errMessage: err.message });
  }
};

const handleValidateCart = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;
    const result = await CartService.validateCart(userId, items);
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ errCode: -1, errMessage: e.message });
  }
};

module.exports = {
  getAllCarts,
  getCartById,
  createCart,
  updateCart,
  deleteCart,
  handleValidateCart,
};
