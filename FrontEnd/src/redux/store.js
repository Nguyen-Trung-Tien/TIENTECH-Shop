import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import userReducer from "./userSlice";
import cartReducer from "./cartSlice";
import checkoutReducer from "./checkoutSlice";

const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
  checkout: checkoutReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "cart"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/REGISTER",
          "persist/FLUSH",
          "persist/PURGE",
        ],
      },
    }),
});

export const persistor = persistStore(store);
