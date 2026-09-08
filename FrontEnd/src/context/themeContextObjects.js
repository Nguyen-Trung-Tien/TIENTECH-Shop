import { createContext } from "react";

export const ThemeContext = createContext();

export const DEFAULT_SYSTEM_SETTINGS = {
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

export const SystemSettingsContext = createContext();
