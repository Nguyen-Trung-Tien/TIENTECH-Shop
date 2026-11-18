import axiosClient from "../utils/axiosClient";

export const submitContactApi = async (data) => {
  const res = await axiosClient.post("/contact", data);
  return res.data;
};
