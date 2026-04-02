import axiosClient from "../utils/axiosClient";

export const getAllBrandApi = async (page = 1, limit = 10, search = "") => {
  try {
    const res = await axiosClient.get(`/brand/get-all-brand`, {
      params: { page, limit, search }
    });
    return res;
  } catch (err) {
    console.error("Get All Brand API error:", err);
    throw err;
  }
};

export const getBrandBySlugApi = async (slug) => {
  try {
    const res = await axiosClient.get(`/brand/get-brand-by-slug/${slug}`);
    return res;
  } catch (err) {
    console.error("Get Brand by Slug API error:", err);
    throw err;
  }
};

export const getBrandByIdApi = async (id) => {
  try {
    const res = await axiosClient.get(`/brand/get-brand/${id}`);
    return res;
  } catch (err) {
    console.error("Get Brand by ID API error:", err);
    throw err;
  }
};

export const createBrandApi = async (data) => {
  try {
    const res = await axiosClient.post(`/brand/create-new-brand`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res;
  } catch (err) {
    console.error("Create Brand API error:", err);
    throw err;
  }
};

export const updateBrandApi = async (id, data) => {
  try {
    const res = await axiosClient.put(`/brand/update-brand/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res;
  } catch (err) {
    console.error("Update Brand API error:", err);
    throw err;
  }
};

export const deleteBrandApi = async (id) => {
  try {
    const res = await axiosClient.delete(`/brand/delete-brand/${id}`);
    return res;
  } catch (err) {
    console.error("Delete Brand API error:", err);
    throw err;
  }
};
