import axiosClient from "../utils/axiosClient";

export const getAllOrders = async (page = 1, limit = 10, token) => {
  try {
    const res = await axiosClient.get("/order/get-all-orders", {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error getting all orders:", error);
    throw error;
  }
};

export const getOrderById = async (orderId, token) => {
  try {
    const res = await axiosClient.get(`/order/get-order/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error getting order by id:", error);
    throw error;
  }
};

export const createOrder = async (data, token) => {
  try {
    const res = await axiosClient.post("/order/create-new-order", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status, token) => {
  try {
    const res = await axiosClient.put(
      `/order/update-status-order/${orderId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const updatePaymentStatus = async (orderId, paymentStatus, token) => {
  try {
    const res = await axiosClient.put(
      `/order/update-payment-status/${orderId}`,
      { paymentStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};

export const deleteOrder = async (orderId, token) => {
  try {
    const res = await axiosClient.delete(`/order/delete-order/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

export const getOrdersByUserId = async (
  token,
  userId,
  page = 1,
  limit = 10,
  status = ""
) => {
  try {
    const res = await axiosClient.get(`/order/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, limit, status },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching user orders:", err);
    throw err;
  }
};

export const getActiveOrdersByUser = async (
  userId,
  token,
  page = 1,
  limit = 10
) => {
  try {
    const res = await axiosClient.get(`/order/active/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page, limit },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching active orders:", err);
    throw err;
  }
};
