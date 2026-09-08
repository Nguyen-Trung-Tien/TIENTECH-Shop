import { useContext } from "react";
import { SystemSettingsContext, DEFAULT_SYSTEM_SETTINGS } from "./themeContextObjects";

export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    return {
      settings: DEFAULT_SYSTEM_SETTINGS,
      loading: false,
      refetchSettings: () => {},
      storeName: "TIENTECH Store",
      storeHotline: "1900 6868",
      storeEmail: "support@tientech.vn",
      storeAddress: "Tầng 5, Tòa Nhà Công Nghệ TIENTECH, Cầu Giấy, Hà Nội",
      defaultShippingFee: 30000,
      freeshipMinOrder: 500000,
      isCodEnabled: true,
      isVnpayEnabled: true,
      isPaypalEnabled: true,
      isMomoEnabled: false,
      isMaintenance: false,
      maintenanceMessage: "",
      isAiEnabled: true,
    };
  }
  return context;
};

export default useSystemSettings;
