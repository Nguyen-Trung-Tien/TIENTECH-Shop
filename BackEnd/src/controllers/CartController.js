const CartService = require("../services/order/CartService");
const { handleResponse, handleError } = require("../utils/controllerHelper");

const getAllCarts = async (req, res) => {
  try {
    const carts = await CartService.getAllCarts(req.user.id);
    return handleResponse(res, { errCode: 0, data: carts }, 200);
  } catch (err) {
    return handleError(res, err, "getAllCarts");
  }
};

const getCartById = async (req, res) => {
  try {
    const cart = await CartService.getCartById(req.params.id, req.user.id);
    if (!cart) {
      return res.status(404).json({
        status: "NOT_FOUND",
        statusCode: 404,
        errCode: 1,
        errMessage: "Không tìm thấy giỏ hàng",
      });
    }
    return handleResponse(res, { errCode: 0, data: cart }, 200);
  } catch (err) {
    return handleError(res, err, "getCartById");
  }
};

const createCart = async (req, res) => {
  try {
    const newCart = await CartService.createCart(req.user.id);
    return handleResponse(res, { errCode: 0, data: newCart }, 201);
  } catch (err) {
    return handleError(res, err, "createCart");
  }
};

const updateCart = async (req, res) => {
  try {
    const updatedCart = await CartService.updateCart(
      req.params.id,
      req.body,
      req.user.id
    );
    return handleResponse(res, { errCode: 0, data: updatedCart }, 200);
  } catch (err) {
    return handleError(res, err, "updateCart");
  }
};

const deleteCart = async (req, res) => {
  try {
    await CartService.deleteCart(req.params.id, req.user.id);
    return handleResponse(res, { errCode: 0, errMessage: "Xóa giỏ hàng thành công!" }, 200);
  } catch (err) {
    return handleError(res, err, "deleteCart");
  }
};

const handleValidateCart = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.id;
    const result = await CartService.validateCart(userId, items);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleValidateCart");
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
