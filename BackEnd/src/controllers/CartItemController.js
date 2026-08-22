const CartItemService = require("../services/order/CartItemService");
const { handleResponse, handleError } = require("../utils/controllerHelper");

const getAllCartItems = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { items, total } = await CartItemService.getAllCartItems(
      req.user.id,
      { limit, offset }
    );

    return handleResponse(
      res,
      {
        errCode: 0,
        data: items,
        pagination: {
          currentPage: page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
        },
      },
      200
    );
  } catch (err) {
    return handleError(res, err, "getAllCartItems");
  }
};

const getCartItemById = async (req, res) => {
  try {
    const item = await CartItemService.getCartItemById(
      req.params.id,
      req.user.id
    );
    if (!item) {
      return res.status(404).json({
        status: "NOT_FOUND",
        statusCode: 404,
        errCode: 1,
        errMessage: "Không tìm thấy sản phẩm trong giỏ hàng.",
      });
    }
    return handleResponse(res, { errCode: 0, data: item }, 200);
  } catch (err) {
    return handleError(res, err, "getCartItemById");
  }
};

const createCartItem = async (req, res) => {
  try {
    const { cartId, productId, variantId, quantity } = req.body;
    const newItem = await CartItemService.createCartItem(
      { cartId, productId, variantId, quantity },
      req.user.id
    );
    return handleResponse(res, { errCode: 0, data: newItem }, 201);
  } catch (err) {
    const isClientError =
      err.message.includes("required") ||
      err.message.includes("not found") ||
      err.message.includes("must be at least") ||
      err.message.includes("hết hàng") ||
      err.message.includes("không đủ");
    const statusCode = isClientError ? 400 : 500;
    return res.status(statusCode).json({
      status: statusCode === 400 ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR",
      statusCode,
      errCode: 1,
      errMessage: err.message,
      message: err.message,
    });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const updatedItem = await CartItemService.updateCartItem(
      req.params.id,
      req.body,
      req.user.id
    );
    return handleResponse(res, { errCode: 0, data: updatedItem }, 200);
  } catch (err) {
    if (err.message === "CartItem not found") {
      return res.status(404).json({
        status: "NOT_FOUND",
        statusCode: 404,
        errCode: 1,
        errMessage: "Không tìm thấy sản phẩm trong giỏ hàng để cập nhật.",
      });
    }
    return handleError(res, err, "updateCartItem");
  }
};

const deleteCartItem = async (req, res) => {
  try {
    await CartItemService.deleteCartItem(req.params.id, req.user.id);
    return handleResponse(res, { errCode: 0, errMessage: "Đã xóa sản phẩm khỏi giỏ hàng." }, 200);
  } catch (err) {
    return handleError(res, err, "deleteCartItem");
  }
};

module.exports = {
  getAllCartItems,
  getCartItemById,
  createCartItem,
  updateCartItem,
  deleteCartItem,
};
