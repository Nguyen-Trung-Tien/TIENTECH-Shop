import React, { useState, useEffect } from "react";
import { getPublicSettingsApi } from "../api/systemSettingApi";
import {
  SystemSettingsContext,
  DEFAULT_SYSTEM_SETTINGS,
} from "./themeContextObjects";

export const SystemSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SYSTEM_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchPublicSettings = async () => {
    try {
      const res = await getPublicSettingsApi();
      if (res && res.errCode === 0 && res.data) {
        const raw = res.data;
        const parsed = { ...DEFAULT_SYSTEM_SETTINGS };
        for (const [k, v] of Object.entries(raw)) {
          if (v === "true" || v === true) parsed[k] = true;
          else if (v === "false" || v === false) parsed[k] = false;
          else if (
            !isNaN(v) &&
            v !== "" &&
            v !== null &&
            (k.includes("FEE") || k.includes("ORDER") || k.includes("MIN"))
          ) {
            parsed[k] = Number(v);
          } else {
            parsed[k] = v;
          }
        }
        setSettings(parsed);
      }
    } catch (err) {
      console.warn("Using default system settings:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicSettings();
  }, []);

  const defaultShippingFee = Number(settings.DEFAULT_SHIPPING_FEE) || 30000;
  const freeshipMinOrder = Number(settings.FREESHIP_MIN_ORDER) || 500000;

  return (
    <SystemSettingsContext.Provider
      value={{
        settings,
        loading,
        refetchSettings: fetchPublicSettings,
        storeName: settings.STORE_NAME || "TIENTECH Store",
        storeHotline: settings.STORE_HOTLINE || "1900 6868",
        storeEmail: settings.STORE_EMAIL || "support@tientech.vn",
        storeAddress:
          settings.STORE_ADDRESS ||
          "Tầng 5, Tòa Nhà Công Nghệ TIENTECH, Cầu Giấy, Hà Nội",
        storeFacebook: settings.STORE_FACEBOOK,
        storeZalo: settings.STORE_ZALO,
        storeTiktok: settings.STORE_TIKTOK,
        defaultShippingFee,
        freeshipMinOrder,
        isCodEnabled: settings.PAYMENT_COD_ENABLED !== false,
        isVnpayEnabled: settings.PAYMENT_VNPAY_ENABLED !== false,
        isPaypalEnabled: settings.PAYMENT_PAYPAL_ENABLED !== false,
        isMomoEnabled: settings.PAYMENT_MOMO_ENABLED === true,
        isMaintenance: settings.MAINTENANCE_MODE === true,
        maintenanceMessage: settings.MAINTENANCE_MESSAGE,
        isAiEnabled: settings.AI_BOT_ENABLED !== false,
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  );
};

export default SystemSettingsProvider;
