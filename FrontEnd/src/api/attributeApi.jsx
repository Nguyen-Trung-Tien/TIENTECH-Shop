import axiosClient from "../utils/axiosClient";

/**
 * Lấy tất cả thuộc tính và giá trị (RAM, ROM, OS...)
 */
export const getAllAttributesApi = async () => {
  try {
    const res = await axiosClient.get("/attribute/get-all");
    return res;
  } catch (err) {
    console.error("Get All Attributes API error:", err);
    throw err;
  }
};

/**
 * Lấy thuộc tính theo mã code
 */
export const getAttributeByCodeApi = async (code) => {
  try {
    const res = await axiosClient.get(`/attribute/get-by-code/${code}`);
    return res;
  } catch (err) {
    console.error("Get Attribute By Code API error:", err);
    throw err;
  }
};
