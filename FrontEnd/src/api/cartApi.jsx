import axiosClient from "../utils/axiosClient";

export const getAllCartItems = async (page = 1, limit = 10) => {
  try {
    const res = await axiosClient.get("/cartItem/get-all-cartItem", {
      params: { page, limit },
    });
    return res;
  } catch (error) {
    console.error("Error getting all cart items:", error);
    throw error;
  }
};

export const addCart = async ({ cartId, productId, variantId, quantity = 1 }) => {
  try {
    const res = await axiosClient.post("/cartItem/create-cartItem", {
      cartId,
      productId,
      variantId,
      quantity,
    });
    return res;
  } catch (error) {
    console.error("Error adding cart item:", error);
    throw error;
  }
};

export const updateCartItem = async (id, quantity) => {
  try {
    const res = await axiosClient.put(`/cartItem/update-cartItem/${id}`, {
      quantity,
    });
    return res;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

export const removeCartItem = async (id) => {
  try {
    const res = await axiosClient.delete(`/cartItem/delete-cartItem/${id}`);
    return res;
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
};

export const validateCart = async (items) => {
  try {
    const res = await axiosClient.post("/cart/validate", { items });
    return res;
  } catch (error) {
    console.error("Error validating cart:", error);
    throw error;
  }
};
