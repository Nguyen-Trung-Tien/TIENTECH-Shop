import axiosClient from "../utils/axiosClient";

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

export const cancelReturnRequest = async (id) => {
  try {
    const res = await axiosClient.put(
      `/order-item/request/${id}/cancel-return`
    );
    return res;
  } catch (error) {
    console.error(`Error cancelling return request for order item ${id}:`, error);
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
