import axiosClient from "../utils/axiosClient";

export const getAllUsersApi = (page, limit, search) =>
  axiosClient.get(`/user/get-all`, { params: { page, limit, query: search } });

export const getUserApi = (id) =>
  axiosClient.get(`/user/get-by-id/${id}`);

export const deleteUserApi = (id) =>
  axiosClient.delete(`/user/delete/${id}`);

export const updateUserApi = (data) => {
  const config = data instanceof FormData 
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : {};
  return axiosClient.put(`/user/update`, data, config);
};

export const registerUser = (data) => {
  const config = data instanceof FormData 
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : {};
  return axiosClient.post(`/user/create`, data, config);
};

export const loginUser = (emailOrData, password) => {
  const data = typeof emailOrData === 'object' ? emailOrData : { email: emailOrData, password };
  return axiosClient.post(`/user/login`, data);
};

export const getMeApi = () => 
  axiosClient.get(`/user/get-me`);

export const logoutUserApi = () =>
  axiosClient.post(`/user/logout`);

export const verifyEmailApi = (emailOrData, token) => {
  const data = typeof emailOrData === 'object' ? emailOrData : { email: emailOrData, token };
  return axiosClient.post(`/user/verify-email`, data);
};

export const resendVerificationApi = (emailOrData) => {
  const data = typeof emailOrData === 'object' ? emailOrData : { email: emailOrData };
  return axiosClient.post(`/user/resend-verification`, data);
};

export const updatePasswordApi = (data) =>
  axiosClient.put(`/user/change-password`, data);

export const forgotPasswordApi = (emailOrData) => {
  const data = typeof emailOrData === 'object' ? emailOrData : { email: emailOrData };
  return axiosClient.post(`/user/forgot-password`, data);
};

export const verifyResetTokenApi = (emailOrData, token) => {
  const data = typeof emailOrData === 'object' ? emailOrData : { email: emailOrData, token };
  return axiosClient.post(`/user/verify-reset-token`, data);
};

export const resetPasswordApi = (emailOrData, token, newPassword) => {
  const data = typeof emailOrData === 'object' ? emailOrData : { email: emailOrData, token, newPassword };
  return axiosClient.post(`/user/reset-password`, data);
};

export const userApi = {
  getAll: getAllUsersApi,
  getById: getUserApi,
  create: registerUser,
  login: loginUser,
  update: (id, data) => {
    if (data instanceof FormData) {
      if (!data.has("id")) data.append("id", id);
      return updateUserApi(data);
    }
    return updateUserApi({ ...data, id });
  },
  delete: deleteUserApi,
  getMe: getMeApi,
  logout: logoutUserApi,
  verifyEmail: verifyEmailApi,
  resendVerification: resendVerificationApi,
  updatePassword: updatePasswordApi,
  forgotPassword: forgotPasswordApi,
  resetPassword: resetPasswordApi
};
