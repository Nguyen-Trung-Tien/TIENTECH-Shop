import axiosClient from "../utils/axiosClient";

export const getAddressesApi = async () => {
  try {
    const res = await axiosClient.get("/address/get-addresses");
    return res;
  } catch (error) {
    console.error("Get addresses API error:", error);
    throw error;
  }
};

export const createAddressApi = async (data) => {
  try {
    const res = await axiosClient.post("/address/create-address", data);
    return res;
  } catch (error) {
    console.error("Create address API error:", error);
    throw error;
  }
};

export const updateAddressApi = async (addressId, data) => {
  try {
    const res = await axiosClient.put(`/address/update-address/${addressId}`, data);
    return res;
  } catch (error) {
    console.error("Update address API error:", error);
    throw error;
  }
};

export const deleteAddressApi = async (addressId) => {
  try {
    const res = await axiosClient.delete(`/address/delete-address/${addressId}`);
    return res;
  } catch (error) {
    console.error("Delete address API error:", error);
    throw error;
  }
};

export const setDefaultAddressApi = async (addressId) => {
  try {
    const res = await axiosClient.patch(`/address/set-default/${addressId}`);
    return res;
  } catch (error) {
    console.error("Set default address API error:", error);
    throw error;
  }
};
