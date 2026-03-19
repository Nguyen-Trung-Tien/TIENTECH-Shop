import { createSlice } from "@reduxjs/toolkit";

const loadFromStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Load từ localStorage thất bại:", e);
    localStorage.removeItem(key);
    return null;
  }
};

// Lưu ý: Không lưu token vào localStorage để tránh XSS.
// Chỉ lưu thông tin cơ bản của user để hiển thị UI nhanh.
const initialState = {
  user: loadFromStorage("user"),
  isAuthenticated: !!loadFromStorage("user"),
  isInitializing: true, // Mặc định là true để App check /me khi khởi động
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Lỗi khi lưu ${key}:`, e);
  }
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      // action.payload có thể là { user } hoặc trực tiếp user data tùy theo API response
      const user = action.payload.user || action.payload;
      const { avatar: _avatar, ...userWithoutAvatar } = user;
      state.user = userWithoutAvatar;
      state.isAuthenticated = true;
      state.isInitializing = false;
      saveToStorage("user", state.user);
    },
    updateUser: (state, action) => {
      const user = action.payload.user || action.payload;
      const { avatar: _avatar, ...updateWithoutAvatar } = user;
      state.user = { ...state.user, ...updateWithoutAvatar };
      saveToStorage("user", state.user);
    },
    removeUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
      localStorage.removeItem("user");
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
