const OrderService = require("../services/order/OrderService");
const NotificationService = require("../services/notification/NotificationService");
const { handleResponse, handleError } = require("../utils/controllerHelper");

const ORDER_STATUS_LABELS = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  processing: "Đang chuẩn bị hàng",
  shipped: "Đang vận chuyển",
  shipping: "Đang giao hàng",
  delivered: "Giao hàng thành công",
  completed: "Hoàn tất đơn hàng",
  cancelled: "Đã hủy đơn hàng",
  cancel_requested: "Yêu cầu hủy đơn",
  return_requested: "Yêu cầu trả hàng",
  returned: "Đã hoàn trả hàng",
};

const handleGetAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm || "";
    const status = req.query.status || "";
    const isReturn = req.query.isReturn === "true";
    const isCancelRequested = req.query.isCancelRequested === "true";

    const result = await OrderService.getAllOrders({
      page,
      limit,
      search: searchTerm,
      searchTerm,
      status,
      hasReturn: isReturn,
      hasCancel: isCancelRequested,
    });
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
    const orderData = { ...req.body };

    // SECURITY: Customers can never specify another user's userId
    if (req.user && req.user.role !== "admin") {
      orderData.userId = req.user.id;
    } else if (!orderData.userId && req.user) {
      orderData.userId = req.user.id;
    }

    const result = await OrderService.createOrder(orderData, req.user);
    if (result.errCode === 0) {
      const io = req.app.get("io");
      
      // 1. Lưu thông báo cho Admin vào DB và gửi socket an toàn
      await NotificationService.createNotification(
        {
          userId: null,
          title: "Đơn hàng mới!",
          message: `Đơn hàng #${result.data.orderCode} vừa được tạo bởi khách hàng.`,
          type: "order",
          link: `/admin/orders`,
        },
        null,
        io
      );

      // 2. Gửi real-time tới Admin nếu io tồn tại (chỉ gửi các trường cần thiết, tránh lộ dữ liệu thừa)
      if (io) {
        io.to("admin_room").emit("new_order", {
          message: "Có đơn hàng mới!",
          orderId: result.data.id,
          orderCode: result.data.orderCode,
          totalPrice: result.data.totalPrice,
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
      const statusText = ORDER_STATUS_LABELS[order.status] || order.status;

      // 1. Lưu thông báo thân thiện và chính xác cho User vào DB
      let userMessage = `Đơn hàng #${order.orderCode} của bạn đã chuyển sang trạng thái: "${statusText}".`;
      if (reason) userMessage += ` (Ghi chú: ${reason})`;

      await NotificationService.createNotification(
        {
          userId: order.userId,
          title: `Cập nhật đơn hàng #${order.orderCode}`,
          message: userMessage,
          type: "order",
          link: `/orders-detail/${id}`,
        },
        null,
        io
      );

      // 2. Nếu đơn hàng chuyển sang trạng thái yêu cầu hủy đơn, gửi thông báo trực tiếp cho Admin
      if (order.status === "cancel_requested") {
        await NotificationService.createNotification(
          {
            userId: null,
            title: "Yêu cầu hủy đơn hàng mới!",
            message: `Khách hàng yêu cầu hủy đơn hàng #${order.orderCode}.${reason ? ` Lý do: ${reason}` : ""}`,
            type: "order",
            link: "/admin/orders?tab=cancel_requested",
          },
          null,
          io
        );

        if (io) {
          io.to("admin_room").emit("new_order", {
            message: `Có yêu cầu hủy đơn hàng #${order.orderCode}`,
            orderId: id,
          });
        }
      }

      // 3. Gửi real-time tới đúng User phòng riêng (kiểm soát chặt chẽ dữ liệu gửi đi)
      if (io) {
        io.to(`user_${order.userId}`).emit("order_status_updated", {
          orderId: id,
          orderCode: order.orderCode,
          status: order.status,
          statusText,
          message: userMessage,
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
    const OrderItemService = require("../services/order/OrderItemService");
    const result = await OrderItemService.requestReturn(orderItemId, reason, req.user);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleRequestReturn");
  }
};

const handleReturnAction = async (req, res) => {
  try {
    const { orderItemId, action, status } = req.body;
    const OrderItemService = require("../services/order/OrderItemService");
    const result = await OrderItemService.processReturn(orderItemId, action || status, req.user);
    return handleResponse(res, result, 200);
  } catch (e) {
    return handleError(res, e, "handleReturnAction");
  }
};

const handleChangePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    const result = await OrderService.changePaymentMethod(id, paymentMethod, req.user);
    if (result.errCode === 0) {
      return handleResponse(res, result, 200);
    }
    return handleResponse(res, result, 400);
  } catch (e) {
    return handleError(res, e, "handleChangePaymentMethod");
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
  handleChangePaymentMethod,
};
