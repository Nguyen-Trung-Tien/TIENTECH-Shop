import { createSlice } from "@reduxjs/toolkit";
import {
  addOrMergeGuestCartItem,
  loadGuestCart,
  removeGuestCartItemById,
  updateGuestCartItemQty,
} from "../utils/guestCart";

const initialState = {
  cartItems: [],
  appliedVoucher: null,
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
      const existingIds = new Set(state.cartItems.map((i) => i.id));
      const nextItems = action.payload.filter((i) => !existingIds.has(i.id));
      state.cartItems = [...state.cartItems, ...nextItems];
    },

    removePurchasedItems: (state, action) => {
      const purchased = Array.isArray(action.payload) ? action.payload : [];
      if (purchased.length === 0) {
        state.cartItems = [];
        state.appliedVoucher = null;
        return;
      }
      const purchasedKeys = new Set(
        purchased.map((it) => `${it.productId || it.product?.id || ""}:${it.variantId || it.variant?.id || ""}`)
      );
      state.cartItems = state.cartItems.filter((item) => {
        const key = `${item.productId || item.product?.id || ""}:${item.variantId || item.variant?.id || ""}`;
        return !purchasedKeys.has(key);
      });
      state.appliedVoucher = null;
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
    },

    hydrateGuestCart: (state) => {
      state.cartItems = loadGuestCart();
    },

    addGuestCartItem: (state, action) => {
      state.cartItems = addOrMergeGuestCartItem({
        ...action.payload,
        currentItems: state.cartItems,
      });
    },

    updateGuestCartQuantity: (state, action) => {
      const { id, quantity } = action.payload || {};
      if (id && quantity > 0) {
        state.cartItems = updateGuestCartItemQty(id, quantity, state.cartItems);
      }
    },

    removeGuestCartItem: (state, action) => {
      state.cartItems = removeGuestCartItemById(action.payload, state.cartItems);
    },

    removePurchasedGuestItems: (state, action) => {
      state.cartItems = removeGuestCartItemById(action.payload, state.cartItems);
      state.appliedVoucher = null;
    },

    applyVoucher: (state, action) => {
      state.appliedVoucher = action.payload;
    },

    removeVoucher: (state) => {
      state.appliedVoucher = null;
    }
  },
});

export const {
  setCartItems,
  appendCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  removePurchasedItems,
  clearCart,
  hydrateGuestCart,
  addGuestCartItem,
  updateGuestCartQuantity,
  removeGuestCartItem,
  removePurchasedGuestItems,
  applyVoucher,
  removeVoucher,
} = cartSlice.actions;

export default cartSlice.reducer;
