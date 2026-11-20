import axiosClient from "../utils/axiosClient";

export const submitContactApi = async (data) => {
  return axiosClient.post("/contact", data);
};

export const getContactTicketsApi = async (params = {}) => {
  return axiosClient.get("/contact/admin/tickets", { params });
};

export const updateContactTicketApi = async (id, data) => {
  return axiosClient.patch(`/contact/admin/tickets/${id}`, data);
};

export const deleteContactTicketApi = async (id) => {
  return axiosClient.delete(`/contact/admin/tickets/${id}`);
};

export const bulkDeleteContactTicketsApi = async (ids = []) => {
  return axiosClient.post("/contact/admin/tickets/bulk-delete", { ids });
};

export const getMyContactTicketsApi = async (params = {}) => {
  return axiosClient.get("/contact/my-tickets", { params });
};

export const updateMyTicketApi = async (id, data) => {
  return axiosClient.patch(`/contact/my-tickets/${id}`, data);
};

export const deleteMyTicketApi = async (id) => {
  return axiosClient.delete(`/contact/my-tickets/${id}`);
};
