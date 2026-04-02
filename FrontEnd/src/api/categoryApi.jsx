import axiosClient from "../utils/axiosClient";
import { createCrudApi } from "./apiFactory";

// Customize endpoints to match existing BackEnd routes
export const getAllCategoryApi = (page, limit, search) => 
  axiosClient.get(`/category/get-all`, { params: { page, limit, search } });

export const getCategoryBySlugApi = (slug) => 
  axiosClient.get(`/category/get-by-slug/${slug}`);

export const getCategoryByIdApi = (id) => 
  axiosClient.get(`/category/get-by-id/${id}`);

export const createCategoryApi = (data) => 
  axiosClient.post(`/category/create`, data, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const updateCategoryApi = (id, data) => 
  axiosClient.put(`/category/update/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const deleteCategoryApi = (id) => 
  axiosClient.delete(`/category/delete/${id}`);

// Export a unified object for useAdminCrud
export const categoryApi = {
  getAll: getAllCategoryApi,
  getById: getCategoryByIdApi,
  getBySlug: getCategoryBySlugApi,
  create: createCategoryApi,
  update: updateCategoryApi,
  delete: deleteCategoryApi
};
