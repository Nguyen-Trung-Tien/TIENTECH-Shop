import axiosClient from "../utils/axiosClient";

export const loginUser = async (email, password) => {
  try {
    const res = await axiosClient.post("/user/login", { email, password });
    return res;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

export const getMeApi = async () => {
  try {
    const res = await axiosClient.get("/user/me");
    return res;
  } catch (error) {
    console.error("Get Me API error:", error);
    throw error;
  }
};

export const registerUser = async (data) => {
  try {
    const res = await axiosClient.post("/user/create-new-user", data);
    return res;
  } catch (error) {
    console.error("Register user API error:", error);
    throw error;
  }
};

export const getUserApi = async (userId) => {
  try {
    const res = await axiosClient.get(`/user/get-user/${userId}`);
    return res;
  } catch (error) {
    console.error("Get user API error:", error);
    throw error;
  }
};

export const updateUserApi = async (data, isFormData = false) => {
  try {
    const res = await axiosClient.put(`/user/update-user`, data, {
      headers: {
        "Content-Type": isFormData ? "multipart/form-data" : "application/json",
      },
    });
    return res;
  } catch (error) {
    console.error("Update user API error:", error);
    throw error;
  }
};

export const getAllUsersApi = async (page = 1, limit = 10) => {
  try {
    const res = await axiosClient.get(
      `/user/get-all-user?page=${page}&limit=${limit}`
    );
    return res;
  } catch (error) {
    console.error("Get all users API error:", error);
    throw error;
  }
};

export const deleteUserApi = async (userId) => {
  try {
    const res = await axiosClient.delete(`/user/delete/${userId}`);
    return res;
  } catch (error) {
    console.error("Delete user API error:", error);
    throw error;
  }
};

export const logoutUserApi = async () => {
  try {
    const res = await axiosClient.post(`/user/logout`);
    return res;
  } catch (error) {
    console.error("Logout user API error:", error);
    throw error;
  }
};

export const updatePasswordApi = async (data) => {
  try {
    const res = await axiosClient.put(`/user/change-password`, data);
    return res;
  } catch (error) {
    console.error("Update password API error:", error);
    throw error;
  }
};

export const forgotPasswordApi = async (email) => {
  try {
    const res = await axiosClient.post("/user/forgot-password", { email });
    return res;
  } catch (error) {
    console.error("Forgot password API error:", error);
    throw error;
  }
};

export const verifyResetTokenApi = async (email, token) => {
  try {
    const res = await axiosClient.post("/user/verify-reset-token", {
      email,
      token,
    });
    return res;
  } catch (error) {
    console.error("Verify reset token API error:", error);
    throw error;
  }
};

export const resetPasswordApi = async (email, token, newPassword) => {
  try {
    const res = await axiosClient.post("/user/reset-password", {
      email,
      token,
      newPassword,
    });
    return res;
  } catch (error) {
    console.error("Reset password API error:", error);
    throw error;
  }
};
