import axiosClient from "../utils/axiosClient";

/**
 * Factory for creating CRUD API methods for a specific endpoint
 * @param {string} endpoint - The base endpoint URL (e.g., "/brand", "/category")
 * @returns {object} - Object containing standard CRUD methods
 */
export const createCrudApi = (endpoint) => {
  return {
    getAll: (page = 1, limit = 10, search = "", extraParams = {}) => {
      return axiosClient.get(`${endpoint}/get-all`, {
        params: { page, limit, search, ...extraParams },
      });
    },

    getById: (id) => {
      return axiosClient.get(`${endpoint}/get-by-id/${id}`);
    },

    getBySlug: (slug) => {
      return axiosClient.get(`${endpoint}/get-by-slug/${slug}`);
    },

    create: (data) => {
      const config = data instanceof FormData 
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
      return axiosClient.post(`${endpoint}/create`, data, config);
    },

    update: (id, data) => {
      const config = data instanceof FormData 
        ? { headers: { "Content-Type": "multipart/form-data" } }
        : {};
      return axiosClient.put(`${endpoint}/update/${id}`, data, config);
    },

    delete: (id) => {
      return axiosClient.delete(`${endpoint}/delete/${id}`);
    },
  };
};
