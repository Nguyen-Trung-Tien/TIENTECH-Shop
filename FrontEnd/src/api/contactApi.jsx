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
