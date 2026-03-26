import { createSlice } from "@reduxjs/toolkit";

// NOTE: redux-persist (store.js) handles persistence automatically.
// We do NOT manually read/write localStorage here to avoid state desync.
const initialState = {
  user: null,
  isAuthenticated: false,
  isInitializing: true, // App sẽ check /me khi khởi động
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      // payload có thể là { user } hoặc trực tiếp user data
      const user = action.payload.user || action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    updateUser: (state, action) => {
      const user = action.payload.user || action.payload;
      state.user = { ...state.user, ...user };
    },
    removeUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
    },
    setInitializing: (state, action) => {
      state.isInitializing = action.payload;
    },
  },
});

export const {
  setUser,
  removeUser,
  updateUser,
  setInitializing,
} = userSlice.actions;
export default userSlice.reducer;
