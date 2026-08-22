import axiosClient from "../utils/axiosClient";

export const getPublicSettingsApi = () =>
  axiosClient.get(`/system-settings/public`);

export const getAllSettingsAdminApi = () =>
  axiosClient.get(`/system-settings/admin/all`);

export const updateSettingAdminApi = (data) =>
  axiosClient.post(`/system-settings/admin/update`, data);

export const toggleOtpSettingAdminApi = (enabled) =>
  axiosClient.post(`/system-settings/admin/toggle-otp`, { enabled });

export const systemSettingApi = {
  getPublic: getPublicSettingsApi,
  getAllAdmin: getAllSettingsAdminApi,
  updateAdmin: updateSettingAdminApi,
  toggleOtpAdmin: toggleOtpSettingAdminApi,
};
