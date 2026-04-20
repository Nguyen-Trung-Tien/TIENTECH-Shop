const runtimeConfig =
  typeof window !== "undefined" ? window.__APP_CONFIG__ || {} : {};

export const appConfig = {
  apiUrl:
    runtimeConfig.VITE_API_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api/v1",
  socketUrl:
    runtimeConfig.VITE_SOCKET_URL ||
    import.meta.env.VITE_SOCKET_URL ||
    "http://localhost:8080",
  paypalClientId:
    runtimeConfig.VITE_PAYPAL_CLIENT_ID ||
    import.meta.env.VITE_PAYPAL_CLIENT_ID ||
    "",
  paypalCurrency:
    runtimeConfig.VITE_PAYPAL_CURRENCY ||
    import.meta.env.VITE_PAYPAL_CURRENCY ||
    "USD",
  showReactQueryDevtools:
    (runtimeConfig.VITE_SHOW_REACT_QUERY_DEVTOOLS ||
      import.meta.env.VITE_SHOW_REACT_QUERY_DEVTOOLS ||
      "false") === "true",
};
