import axiosClient from "../utils/axiosClient";

export const getVariantsByProduct = async (productId) => {
  try {
    const res = await axiosClient.get(`/variant/product/${productId}`);
    return res;
  } catch (err) {
    console.error("Get variants error:", err);
    throw err;
  }
};

export const createVariant = async (data) => {
  try {
    const res = await axiosClient.post(`/variant/create`, data);
    return res;
  } catch (err) {
    console.error("Create variant error:", err);
    throw err;
  }
};

export const updateVariant = async (id, data) => {
  try {
    const res = await axiosClient.put(`/variant/update/${id}`, data);
    return res;
  } catch (err) {
    console.error("Update variant error:", err);
    throw err;
  }
};

export const deleteVariant = async (id) => {
  try {
    const res = await axiosClient.delete(`/variant/delete/${id}`);
    return res;
  } catch (err) {
    console.error("Delete variant error:", err);
    throw err;
  }
};
