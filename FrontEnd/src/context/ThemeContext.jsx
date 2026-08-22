import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") || localStorage.getItem("admin_theme");
      if (savedTheme) return savedTheme;
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
  };

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem("theme", theme);
    localStorage.setItem("admin_theme", theme);
  }, [theme]);

  // Sync across browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "theme" || e.key === "admin_theme") {
        if (e.newValue && (e.newValue === "light" || e.newValue === "dark")) {
          setThemeState(e.newValue);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme) => {
    if (newTheme === "light" || newTheme === "dark") {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

/* =========================================================================
   SYSTEM SETTINGS CONTEXT & HOOK
   ========================================================================= */
import { getPublicSettingsApi } from "../api/systemSettingApi";

const DEFAULT_SYSTEM_SETTINGS = {
  STORE_NAME: "TIENTECH Store",
  STORE_HOTLINE: "1900 6868",
  STORE_EMAIL: "support@tientech.vn",
  STORE_ADDRESS: "Tầng 5, Tòa Nhà Công Nghệ TIENTECH, Cầu Giấy, Hà Nội",
  STORE_FACEBOOK: "https://facebook.com/tientech.official",
  STORE_ZALO: "https://zalo.me/tientech",
  STORE_TIKTOK: "https://tiktok.com/@tientech_shop",
  DEFAULT_SHIPPING_FEE: 30000,
  FREESHIP_MIN_ORDER: 500000,
  PAYMENT_COD_ENABLED: true,
  PAYMENT_VNPAY_ENABLED: true,
  PAYMENT_PAYPAL_ENABLED: true,
  PAYMENT_MOMO_ENABLED: false,
  MAINTENANCE_MODE: false,
  MAINTENANCE_MESSAGE: "Hệ thống đang bảo trì định kỳ. Quý khách vui lòng quay lại sau!",
  AI_BOT_ENABLED: true,
};

const SystemSettingsContext = createContext();

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
          else if (!isNaN(v) && v !== "" && v !== null && (k.includes("FEE") || k.includes("ORDER") || k.includes("MIN"))) {
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
        storeAddress: settings.STORE_ADDRESS || "Tầng 5, Tòa Nhà Công Nghệ TIENTECH, Cầu Giấy, Hà Nội",
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

export default ThemeContext;
