import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
  appliedVoucher: JSON.parse(localStorage.getItem("appliedVoucher")) || null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCartItems: (state, action) => {
      if (!Array.isArray(action.payload)) return;
      state.cartItems = action.payload;
    },

    appendCartItems: (state, action) => {
      if (!Array.isArray(action.payload)) return;
      state.cartItems = action.payload;
    },

    addCartItem: (state, action) => {
      const item = action.payload;
      if (!item) return;

      // Unique key for cart item is id from database
      const index = state.cartItems.findIndex((i) => i.id === item.id);
      if (index >= 0) {
        state.cartItems[index].quantity = item.quantity; // Update to latest from server
      } else {
        state.cartItems.push(item);
      }
    },

    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload || {};
      const item = state.cartItems.find((i) => i.id === id);
      if (item && quantity > 0) {
        item.quantity = quantity;
      }
    },

    removeCartItem: (state, action) => {
      state.cartItems = state.cartItems.filter((i) => i.id !== action.payload);
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.appliedVoucher = null;
      localStorage.removeItem("appliedVoucher");
    },

    applyVoucher: (state, action) => {
      state.appliedVoucher = action.payload;
      localStorage.setItem("appliedVoucher", JSON.stringify(action.payload));
    },

    removeVoucher: (state) => {
      state.appliedVoucher = null;
      localStorage.removeItem("appliedVoucher");
    }
  },
});

export const {
  setCartItems,
  appendCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  applyVoucher,
  removeVoucher,
} = cartSlice.actions;

export default cartSlice.reducer;
