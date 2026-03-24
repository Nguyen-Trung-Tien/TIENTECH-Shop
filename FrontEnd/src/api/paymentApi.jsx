import axiosClient from "../utils/axiosClient";

// VNPAY
export const createVnpayPaymentApi = async (data) => {
  return await axiosClient.post("/vnpay/create-vnpay-payment", data);
};

// Admin Payment Management
export const getAllPayments = async (page = 1, limit = 10, status = "all") => {
  return await axiosClient.get("/payment/get-all-payment", {
    params: { page, limit, status },
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

export const completePayment = async (id) => {
  return await axiosClient.put(`/payment/payment-complete/${id}/complete`);
};

export const refundPayment = async (id) => {
  return await axiosClient.put(`/payment/payment-refund/${id}/refund`);
};
