import axiosClient from "../utils/axiosClient";

// Ensure the endpoint matches BackEnd prefix exactly
const BASE_URL = "/voucher"; 

export const getAllVouchersApi = (page, limit, search) => 
  axiosClient.get(`${BASE_URL}/get-all`, { params: { page, limit, search } });

export const getVoucherByIdApi = (id) => 
  axiosClient.get(`${BASE_URL}/get-by-id/${id}`);

export const createVoucherApi = (data) => 
  axiosClient.post(`${BASE_URL}/create`, data);

export const updateVoucherApi = (id, data) => 
  axiosClient.put(`${BASE_URL}/update/${id}`, data);

export const deleteVoucherApi = (id) => 
  axiosClient.delete(`${BASE_URL}/delete/${id}`);

export const getActiveVouchersApi = () =>
  axiosClient.get(`${BASE_URL}/active`);

export const checkVoucherApi = (data) =>
  axiosClient.post(`${BASE_URL}/check`, data);

export const voucherApi = {
  getAll: getAllVouchersApi,
  getById: getVoucherByIdApi,
  create: createVoucherApi,
  update: updateVoucherApi,
  delete: deleteVoucherApi,
  getActive: getActiveVouchersApi,
  check: checkVoucherApi
};
