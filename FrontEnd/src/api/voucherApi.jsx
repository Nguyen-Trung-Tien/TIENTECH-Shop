import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

export const checkVoucherApi = async (code, orderTotal) => {
  try {
    const res = await axios.post(`${API_URL}/voucher/check`, {
      code,
      orderTotal,
    });
    return res.data;
  } catch (error) {
    return error.response?.data || { errCode: -1, errMessage: "Lỗi hệ thống" };
  }
};

export const getAllVouchersApi = async () => {
  try {
    const res = await axios.get(`${API_URL}/voucher/get-all`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return error.response?.data || { errCode: -1, errMessage: "Lỗi hệ đồng" };
  }
};

export const createVoucherApi = async (data) => {
  try {
    const res = await axios.post(`${API_URL}/voucher/create`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return error.response?.data || { errCode: -1, errMessage: "Lỗi hệ đồng" };
  }
};

export const updateVoucherApi = async (id, data) => {
  try {
    const res = await axios.put(`${API_URL}/voucher/update/${id}`, data, { withCredentials: true });
    return res.data;
  } catch (error) {
    return error.response?.data || { errCode: -1, errMessage: "Lỗi hệ đồng" };
  }
};

export const deleteVoucherApi = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/voucher/delete/${id}`, { withCredentials: true });
    return res.data;
  } catch (error) {
    return error.response?.data || { errCode: -1, errMessage: "Lỗi hệ đồng" };
  }
};
