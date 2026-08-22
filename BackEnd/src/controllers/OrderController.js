const OrderService = require("../services/order/OrderService");
const NotificationService = require("../services/notification/NotificationService");
const { handleResponse, handleError } = require("../utils/controllerHelper");

const handleGetAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm || "";
    const status = req.query.status || "";
    const isReturn = req.query.isReturn === "true";
    const isCancelRequested = req.query.isCancelRequested === "true";

    const result = await OrderService.getAllOrders(page, limit, searchTerm, status, isReturn, isCancelRequested);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleGetAllOrders");
  }
};

const handleGetOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await OrderService.getOrderById(id, req.user);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleGetOrderById");
  }
};

const handleCreateOrder = async (req, res) => {
  try {
    const result = await OrderService.createOrder(req.body);
    if (result.errCode === 0) {
      const io = req.app.get("io");
      
      // 1. Lưu thông báo cho Admin vào DB
      await NotificationService.createNotification({
        title: "Đơn hàng mới!",
        message: `Đơn hàng #${result.data.orderCode} vừa được tạo.`,
        type: "order",
        link: `/admin/orders`,
      });

      // 2. Gửi real-time tới Admin nếu io tồn tại
      if (io) {
        io.to("admin_room").emit("new_order", {
          message: "Có đơn hàng mới!",
          order: result.data,
        });
      }
      return handleResponse(res, result, 201);
    }
    return handleResponse(res, result, 400);
  } catch (e) {
    return handleError(res, e, "handleCreateOrder");
  }
};

const handleUpdateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const result = await OrderService.updateOrderStatus(id, status, req.user, reason);
    
    if (result.errCode === 0) {
      const io = req.app.get("io");
      const order = result.data;

      // 1. Lưu thông báo cho User vào DB
      await NotificationService.createNotification({
        userId: order.userId,
        title: "Cập nhật đơn hàng",
        message: `Đơn hàng #${order.orderCode} của bạn đã chuyển sang trạng thái: ${status}`,
        type: "order",
        link: `/orders-detail/${id}`,
      });

      // 2. Gửi real-time tới User nếu io tồn tại
      if (io) {
        io.to(`user_${order.userId}`).emit("order_status_updated", {
          orderId: id,
          status: status,
          message: `Đơn hàng #${id} của bạn đã chuyển sang trạng thái: ${status}`,
        });
      }
    }
    
    return handleResponse(res, result, 200);
  } catch (error) {
    return handleError(res, error, "handleUpdateOrderStatus");
  }
};

const handleDeleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await OrderService.deleteOrder(id);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleDeleteOrder");
  }
};

const handleUpdatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const result = await OrderService.updatePaymentStatus(id, paymentStatus);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleUpdatePaymentStatus");
  }
};

const handleGetOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "all";

    if (req.user.role !== "admin" && String(req.user.id) !== String(userId)) {
      return res.status(403).json({
        status: "FORBIDDEN",
        statusCode: 403,
        errCode: 403,
        errMessage: "Bạn không có quyền truy cập đơn hàng của người dùng khác.",
        message: "Forbidden",
      });
    }

    const result = await OrderService.getOrdersByUserId(userId, page, limit, status);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleGetOrdersByUserId");
  }
};

const getActiveOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 10 } = req.query;

    if (req.user.role !== "admin" && String(req.user.id) !== String(userId)) {
      return res.status(403).json({
        status: "FORBIDDEN",
        statusCode: 403,
        errCode: 403,
        errMessage: "Bạn không có quyền truy cập đơn hàng của người dùng khác.",
        message: "Forbidden",
      });
    }

    const result = await OrderService.getActiveOrdersByUserId(
      userId,
      +page,
      +limit
    );

    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "getActiveOrdersByUserId");
  }
};

const handleRequestReturn = async (req, res) => {
  try {
    const { orderItemId, reason } = req.body;
    const userId = req.user.id;
    const result = await OrderService.requestReturn(orderItemId, userId, reason);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleRequestReturn");
  }
};

const handleReturnAction = async (req, res) => {
  try {
    const { orderItemId, action } = req.body;
    const adminId = req.user.id;
    const result = await OrderService.handleReturnAction(orderItemId, action, adminId);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleReturnAction");
  }
};

module.exports = {
  handleGetAllOrders,
  handleGetOrderById,
  handleCreateOrder,
  handleUpdateOrderStatus,
  handleDeleteOrder,
  handleUpdatePaymentStatus,
  handleGetOrdersByUserId,
  getActiveOrdersByUserId,
  handleRequestReturn,
  handleReturnAction,
};
