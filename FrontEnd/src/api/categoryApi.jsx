import axiosClient from "../utils/axiosClient";

export const getAllCategoryApi = async (page = 1, limit = 10, search = "") => {
  try {
    const res = await axiosClient.get("/category/get-all-category", {
      params: { page, limit, search }
    });
    return res;
  } catch (err) {
    console.error("Get All Category API error:", err);
    throw err;
  }
};

export const getCategoryBySlugApi = async (slug) => {
  try {
    const res = await axiosClient.get(`/category/get-category-by-slug/${slug}`);
    return res;
  } catch (err) {
    console.error("Get Category by Slug API error:", err);
    throw err;
  }
};

export const createCategoryApi = async (data) => {
  try {
    const res = await axiosClient.post("/category/create", data);
    return res;
  } catch (err) {
    console.error("Create Category API error:", err);
    throw err;
  }
};

export const updateCategoryApi = async (id, data) => {
  try {
    const res = await axiosClient.put(`/category/update/${id}`, data);
    return res;
  } catch (err) {
    console.error("Update Category API error:", err);
    throw err;
  }
};

export const deleteCategoryApi = async (id) => {
  try {
    const res = await axiosClient.delete(`/category/delete/${id}`);
    return res;
  } catch (err) {
    console.error("Delete Category API error:", err);
    throw err;
  }
};
