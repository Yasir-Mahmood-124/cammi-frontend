// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./services/auth/authSlice";
import { authApi } from "./services/auth/authApi";

// Create the store
export const store = configureStore({
  reducer: {
    auth: authReducer, // slice reducer
    [authApi.reducerPath]: authApi.reducer, // RTK Query API reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware),
});

// Infer types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
