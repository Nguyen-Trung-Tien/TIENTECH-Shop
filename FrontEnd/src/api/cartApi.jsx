import axiosClient from "../utils/axiosClient";

export const getAllCarts = async () => {
  try {
    const res = await axiosClient.get("/cart/get-all-cart");
    return res;
  } catch (error) {
    console.error("Error getting all carts:", error);
    throw error;
  }
};

export const getCartById = async (id) => {
  try {
    const res = await axiosClient.get(`/cart/get-cart/${id}`);
    return res;
  } catch (error) {
    console.error("Error getting cart by id:", error);
    throw error;
  }
};

export const createCart = async (userId) => {
  try {
    const res = await axiosClient.post("/cart/create-cart", { userId });
    return res;
  } catch (error) {
    console.error("Error creating cart:", error);
    throw error;
  }
};

export const updateCart = async ({ id, data }) => {
  try {
    const res = await axiosClient.put(`/cart/update-cart/${id}`, data);
    return res;
  } catch (error) {
    console.error("Error updating cart:", error);
    throw error;
  }
};

export const deleteCart = async (id) => {
  try {
    const res = await axiosClient.delete(`/cart/delete-cart/${id}`);
    return res;
  } catch (error) {
    console.error("Error deleting cart:", error);
    throw error;
  }
};

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

export const getCartItemById = async (id) => {
  try {
    const res = await axiosClient.get(`/cartItem/get-cartItem/${id}`);
    return res;
  } catch (error) {
    console.error("Error getting cart item by id:", error);
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
