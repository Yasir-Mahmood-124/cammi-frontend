// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./services/auth/authSlice";
import { authApi } from "./services/auth/authApi";
import { onboardingApi } from "./services/onboarding/onboardingApi";
import { googleApi } from "./services/auth/googleApi";
import { projectsApi } from "./services/projects/projectApi";
import { reviewApi } from "./services/documentReview/reviewApi";
// Create the store
export const store = configureStore({
  reducer: {
    auth: authReducer, // slice reducer
    [authApi.reducerPath]: authApi.reducer, // RTK Query API reducer
    [onboardingApi.reducerPath]: onboardingApi.reducer,
    [googleApi.reducerPath]: googleApi.reducer,
    [projectsApi.reducerPath]: projectsApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(onboardingApi.middleware)
      .concat(googleApi.middleware)
      .concat(projectsApi.middleware)
      .concat(reviewApi.middleware),
});

// Infer types for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
