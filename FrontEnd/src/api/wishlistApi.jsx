import axiosClient from "../utils/axiosClient";

export const addToWishlistApi = async (productId) => {
  try {
    const res = await axiosClient.post("/wishlist/add", { productId });
    return res;
  } catch (error) {
    console.error("Add to wishlist API error:", error);
    throw error;
  }
};

export const removeFromWishlistApi = async (productId) => {
  try {
    const res = await axiosClient.delete(`/wishlist/remove/${productId}`);
    return res;
  } catch (error) {
    console.error("Remove from wishlist API error:", error);
    throw error;
  }
};

export const getWishlistApi = async () => {
  try {
    const res = await axiosClient.get("/wishlist/get-all");
    return res;
  } catch (error) {
    console.error("Get wishlist API error:", error);
    throw error;
  }
};

export const checkWishlistStatusApi = async (productId) => {
  try {
    const res = await axiosClient.get(`/wishlist/check/${productId}`);
    return res;
  } catch (error) {
    console.error("Check wishlist status API error:", error);
    throw error;
  }
};
