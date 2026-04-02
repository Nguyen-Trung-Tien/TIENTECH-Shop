import axiosClient from "../utils/axiosClient";

export const getAllBrandApi = (page, limit, search) => 
  axiosClient.get(`/brand/get-all`, { params: { page, limit, search } });

export const getBrandBySlugApi = (slug) => 
  axiosClient.get(`/brand/get-by-slug/${slug}`);

export const getBrandByIdApi = (id) => 
  axiosClient.get(`/brand/get-by-id/${id}`);

export const createBrandApi = (data) => 
  axiosClient.post(`/brand/create`, data, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const updateBrandApi = (id, data) => 
  axiosClient.put(`/brand/update/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const deleteBrandApi = (id) => 
  axiosClient.delete(`/brand/delete/${id}`);

export const brandApi = {
  getAll: getAllBrandApi,
  getById: getBrandByIdApi,
  getBySlug: getBrandBySlugApi,
  create: createBrandApi,
  update: updateBrandApi,
  delete: deleteBrandApi
};
