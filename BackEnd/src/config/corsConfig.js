const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "https://tientech-shop-9247.vercel.app",
];

const getFrontendUrl = () => {
  const raw = process.env.FRONTEND_URL;
  if (raw && typeof raw === "string" && raw.trim()) {
    return raw.trim().replace(/\/+$/, "");
  }
  return "http://localhost:5173";
};

const getAllowedOrigins = () => {
  const origins = [...DEFAULT_ALLOWED_ORIGINS];
  const frontendUrl = getFrontendUrl();
  if (frontendUrl && !origins.includes(frontendUrl)) {
    origins.push(frontendUrl);
  }
  return origins;
};

module.exports = {
  getAllowedOrigins,
  getFrontendUrl,
};
