import { createSlice } from "@reduxjs/toolkit";

export const CHECKOUT_SESSION_KEY = "tientech_checkout_session";

const DEFAULT_FORM_DATA = {
  username: "",
  phone: "",
  address: "",
  email: "",
  note: "",
  paymentMethod: "COD",
};

const getDefaultCheckoutState = () => ({
  formData: { ...DEFAULT_FORM_DATA },
  selectedIds: [],
  items: [],
  mode: "cart", // "buy_now" | "cart"
  pointsUsed: 0,
});

export const loadCheckoutSession = () => {
  const defaults = getDefaultCheckoutState();
  if (typeof window === "undefined" || !window.sessionStorage) {
    return defaults;
  }
  try {
    const raw = window.sessionStorage.getItem(CHECKOUT_SESSION_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaults;
    return {
      formData: {
        ...DEFAULT_FORM_DATA,
        ...(parsed.formData && typeof parsed.formData === "object"
          ? parsed.formData
          : {}),
      },
      selectedIds: Array.isArray(parsed.selectedIds) ? parsed.selectedIds : [],
      items: Array.isArray(parsed.items) ? parsed.items : [],
      mode: parsed.mode === "buy_now" ? "buy_now" : "cart",
      pointsUsed:
        typeof parsed.pointsUsed === "number" && parsed.pointsUsed >= 0
          ? Math.floor(parsed.pointsUsed)
          : 0,
    };
  } catch {
    return defaults;
  }
};

const saveCheckoutSession = (state) => {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    window.sessionStorage.setItem(
      CHECKOUT_SESSION_KEY,
      JSON.stringify({
        formData: state.formData,
        selectedIds: state.selectedIds,
        items: state.items,
        mode: state.mode,
        pointsUsed: state.pointsUsed,
      }),
    );
  } catch {
    // Ignore storage quota or security errors
  }
};

const clearCheckoutStorage = () => {
  if (typeof window === "undefined" || !window.sessionStorage) return;
  try {
    window.sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
};

const initialState = loadCheckoutSession();

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = {
        ...DEFAULT_FORM_DATA,
        ...(action.payload || {}),
      };
      saveCheckoutSession(state);
    },
    setSelectedIds: (state, action) => {
      state.selectedIds = Array.isArray(action.payload) ? action.payload : [];
      saveCheckoutSession(state);
    },
    setBuyNowCheckout: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : [];
      state.items = items;
      state.mode = "buy_now";
      state.selectedIds = items.map((item) => item.id).filter(Boolean);
      state.pointsUsed = 0;
      saveCheckoutSession(state);
    },
    setCartCheckout: (state, action) => {
      const items = Array.isArray(action.payload) ? action.payload : [];
      state.items = items;
      state.mode = "cart";
      state.selectedIds = items.map((item) => item.id).filter(Boolean);
      saveCheckoutSession(state);
    },
    setCheckoutPointsUsed: (state, action) => {
      const val = Number(action.payload);
      state.pointsUsed = Number.isFinite(val) && val > 0 ? Math.floor(val) : 0;
      saveCheckoutSession(state);
    },
    clearCheckoutSession: (state) => {
      state.items = [];
      state.selectedIds = [];
      state.mode = "cart";
      state.pointsUsed = 0;
      saveCheckoutSession(state);
    },
    resetCheckout: (state) => {
      const defaults = getDefaultCheckoutState();
      state.formData = defaults.formData;
      state.selectedIds = defaults.selectedIds;
      state.items = defaults.items;
      state.mode = defaults.mode;
      state.pointsUsed = defaults.pointsUsed;
      clearCheckoutStorage();
    },
  },
});

export const {
  setFormData,
  setSelectedIds,
  setBuyNowCheckout,
  setCartCheckout,
  setCheckoutPointsUsed,
  clearCheckoutSession,
  resetCheckout,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;
