export const SETTING_CATEGORY_TABS = [
  { id: "all", label: "Tất Cả Cấu Hình", iconType: "sliders" },
  { id: "maintenance", label: "Bảo Trì & Vận Hành", iconType: "activity" },
  { id: "email", label: "Email & Thông Báo Đơn", iconType: "mail" },
  { id: "payment", label: "Thanh Toán & Vận Chuyển", iconType: "credit" },
  { id: "store", label: "Thương Hiệu & SEO", iconType: "globe" },
  { id: "auth", label: "Xác Thực & Bảo Mật", iconType: "shield" },
  { id: "ai", label: "Trợ Lý AI & Chatbot", iconType: "zap" },
];

export const isBooleanSetting = (item, val) => {
  if (typeof val === "boolean") return true;
  if (val === "true" || val === "false") return true;
  if (item.value === "true" || item.value === "false") return true;
  const k = item.key || "";
  return (
    k.includes("_ENABLED") ||
    k.startsWith("REQUIRE_") ||
    k === "MAINTENANCE_MODE" ||
    k.startsWith("EMAIL_NOTIFY_")
  );
};

export const isTextareaSettingKey = (key = "") =>
  key.includes("PROMPT") ||
  key.includes("DESCRIPTION") ||
  key.includes("MESSAGE");

export const isNumericSettingKey = (key = "") =>
  key.includes("FEE") ||
  key.includes("ORDER") ||
  key.includes("ATTEMPTS") ||
  key.includes("MINUTES");
