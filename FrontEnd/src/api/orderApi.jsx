import axiosClient from "../utils/axiosClient";

export const getAllOrders = async (page = 1, limit = 10) => {
  try {
    const res = await axiosClient.get("/order/get-all-orders", {
      params: { page, limit },
    });
    return res;
  } catch (error) {
    console.error("Error getting all orders:", error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const res = await axiosClient.get(`/order/get-order/${orderId}`);
    return res;
  } catch (error) {
    console.error("Error getting order by id:", error);
    throw error;
  }
};

export const createOrder = async (data) => {
  try {
    const res = await axiosClient.post("/order/create-new-order", data);
    return res;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const res = await axiosClient.put(
      `/order/update-status-order/${orderId}/status`,
      { status }
    );
    return res;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const updatePaymentStatus = async (orderId, paymentStatus) => {
  try {
    const res = await axiosClient.put(
      `/order/update-payment-status/${orderId}`,
      { paymentStatus }
    );
    return res;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const res = await axiosClient.delete(`/order/delete-order/${orderId}`);
    return res;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

export const getOrdersByUserId = async (
  userId,
  page = 1,
  limit = 10,
  status = ""
) => {
  try {
    const res = await axiosClient.get(`/order/user/${userId}`, {
      params: { page, limit, status },
    });
    return res;
  } catch (err) {
    console.error("Error fetching user orders:", err);
    throw err;
  }
};

export const getActiveOrdersByUser = async (userId, page = 1, limit = 10) => {
  try {
    const res = await axiosClient.get(`/order/active/${userId}`, {
      params: { page, limit },
    });
    return res;
  } catch (err) {
    console.error("Error fetching active orders:", err);
    throw err;
  }
};
