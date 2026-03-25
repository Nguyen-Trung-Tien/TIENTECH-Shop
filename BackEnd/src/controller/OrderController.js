const OrderService = require("../services/OrderService");
const NotificationService = require("../services/NotificationService");

const handleGetAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerm = req.query.searchTerm || "";
    const status = req.query.status || "";

    const result = await OrderService.getAllOrders(page, limit, searchTerm, status);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await OrderService.getOrderById(id, req.user);

    return res.status(result.status || 200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
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
        link: `/admin/orders`
      });

      // 2. Gửi real-time tới Admin
      io.to("admin_room").emit("new_order", {
        message: "Có đơn hàng mới!",
        order: result.data,
      });
    }
    return res.status(201).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleUpdateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await OrderService.updateOrderStatus(id, status, req.user);
    
    if (result.errCode === 0) {
      const io = req.app.get("io");
      const order = result.data;

      // 1. Lưu thông báo cho User vào DB
      await NotificationService.createNotification({
        userId: order.userId,
        title: "Cập nhật đơn hàng",
        message: `Đơn hàng #${order.orderCode} của bạn đã chuyển sang trạng thái: ${status}`,
        type: "order",
        link: `/orders-detail/${id}`
      });

      // 2. Gửi real-time tới User (room được đặt theo userId)
      io.to(`user_${order.userId}`).emit("order_status_updated", {
        orderId: id,
        status: status,
        message: `Đơn hàng #${id} của bạn đã chuyển sang trạng thái: ${status}`
      });
    }
    
    return res.status(result.status || 200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleDeleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await OrderService.deleteOrder(id);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleUpdatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const result = await OrderService.updatePaymentStatus(id, paymentStatus);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const handleGetOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (req.user.role !== "admin" && String(req.user.id) !== String(userId)) {
      return res.status(403).json({
        errCode: 403,
        errMessage: "Forbidden",
      });
    }

    const result = await OrderService.getOrdersByUserId(userId, page, limit);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Internal server error",
    });
  }
};

const getActiveOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 10 } = req.query;

    if (req.user.role !== "admin" && String(req.user.id) !== String(userId)) {
      return res.status(403).json({
        errCode: 403,
        errMessage: "Forbidden",
      });
    }

    const result = await OrderService.getActiveOrdersByUserId(
      userId,
      +page,
      +limit
    );

    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in getActiveOrdersByUserId:", e);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error fetching active orders",
    });
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
};
