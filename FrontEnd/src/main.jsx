import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import App from "./App";
import "./tailwind.css";
import { store, persistor } from "./redux/store";
import { appConfig } from "./config/runtimeConfig";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const initialOptions = {
  "client-id": appConfig.paypalClientId,
  currency: appConfig.paypalCurrency,
  intent: "capture",
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PayPalScriptProvider options={initialOptions}>
            <App />
          </PayPalScriptProvider>
          {appConfig.showReactQueryDevtools && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </BrowserRouter>
      </QueryClientProvider>
    </PersistGate>
  </Provider>,
);
