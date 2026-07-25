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
      try {
        localStorage.setItem("cartItems", JSON.stringify(action.payload));
      } catch (e) {
        console.error("Failed to save cartItems to localStorage", e);
      }
    },

    appendCartItems: (state, action) => {
      if (!Array.isArray(action.payload)) return;
      state.cartItems = action.payload;
      try {
        localStorage.setItem("cartItems", JSON.stringify(action.payload));
      } catch (e) {
        console.error("Failed to save cartItems to localStorage", e);
      }
    },

    addCartItem: (state, action) => {
      const item = action.payload;
      if (!item) return;

      const index = state.cartItems.findIndex((i) => i.id === item.id);
      if (index >= 0) {
        state.cartItems[index].quantity = item.quantity;
      } else {
        state.cartItems.push(item);
      }
      try {
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      } catch (e) {
        console.error("Failed to save cartItems to localStorage", e);
      }
    },

    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload || {};
      const item = state.cartItems.find((i) => i.id === id);
      if (item && quantity > 0) {
        item.quantity = quantity;
        try {
          localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        } catch (e) {
          console.error("Failed to save cartItems to localStorage", e);
        }
      }
    },

    removeCartItem: (state, action) => {
      state.cartItems = state.cartItems.filter((i) => i.id !== action.payload);
      try {
        localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
      } catch (e) {
        console.error("Failed to save cartItems to localStorage", e);
      }
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.appliedVoucher = null;
      try {
        localStorage.removeItem("cartItems");
        localStorage.removeItem("appliedVoucher");
      } catch (e) {
        console.error("Failed to clear cart localStorage", e);
      }
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
