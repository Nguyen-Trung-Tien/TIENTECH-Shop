import axiosClient from "../utils/axiosClient";

export const getAllOrderItems = async () => {
  try {
    const res = await axiosClient.get("/order-item/get-order-item");
    return res;
  } catch (error) {
    console.error("Error getting all order items:", error);
    throw error;
  }
};

export const getOrderItemById = async (id) => {
  try {
    const res = await axiosClient.get(`/order-item/order-item/${id}`);
    return res;
  } catch (error) {
    console.error(`Error getting order item with id ${id}:`, error);
    throw error;
  }
};

export const createOrderItem = async (data) => {
  try {
    const res = await axiosClient.post(
      "/order-item/create-new-order-item",
      data
    );
    return res;
  } catch (error) {
    console.error("Error creating order item:", error);
    throw error;
  }
};

export const updateOrderItem = async (id, data) => {
  try {
    const res = await axiosClient.put(
      `/order-item/update-order-item/${id}`,
      data
    );
    return res;
  } catch (error) {
    console.error(`Error updating order item ${id}:`, error);
    throw error;
  }
};

export const deleteOrderItem = async (id) => {
  try {
    const res = await axiosClient.delete(
      `/order-item/delete-order-item/${id}`
    );
    return res;
  } catch (error) {
    console.error(`Error deleting order item ${id}:`, error);
    throw error;
  }
};

export const requestReturn = async (id, reason) => {
  try {
    const res = await axiosClient.put(
      `/order-item/request/${id}/request-return`,
      { reason }
    );
    return res;
  } catch (error) {
    console.error(`Error requesting return for order item ${id}:`, error);
    throw error;
  }
};

export const processReturn = async (id, status) => {
  try {
    const res = await axiosClient.put(
      `/order-item/process/${id}/process-return`,
      { status }
    );
    return res;
  } catch (error) {
    console.error(`Error processing return for order item ${id}:`, error);
    throw error;
  }
};
