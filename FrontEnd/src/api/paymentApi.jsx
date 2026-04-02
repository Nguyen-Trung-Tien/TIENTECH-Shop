import axiosClient from "../utils/axiosClient";

// VNPAY
export const createVnpayPaymentApi = async (data) => {
  return await axiosClient.post("/vnpay/create-vnpay-payment", data);
};

// Admin Payment Management
export const getAllPayments = async (params = {}) => {
  return await axiosClient.get("/payment/get-all-payment", {
    params,
  });
};

export const getPaymentById = async (id) => {
  return await axiosClient.get(`/payment/get-payment/${id}`);
};

export const deletePayment = async (id) => {
  return await axiosClient.delete(`/payment/delete-payment/${id}`);
};

export const updatePayment = async (orderId, data) => {
  return await axiosClient.put(`/payment/update-payment/${orderId}`, data);
};

export const completePayment = async (id, data = {}) => {
  return await axiosClient.put(`/payment/payment-complete/${id}/complete`, data);
};

export const refundPayment = async (id, note = "") => {
  return await axiosClient.put(`/payment/payment-refund/${id}/refund`, { note });
};
