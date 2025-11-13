// src/redux/services/settings/profileSettings.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// 🔹 Define request body type
export interface EditProfileRequest {
  session_id: string;
  name: string;
  picture: string; // base64 string
}

// 🔹 Define response type (you can refine it later if you know the structure)
export interface EditProfileResponse {
  message?: string;
  success?: boolean;
  [key: string]: any; // to handle extra unknown keys
}

// 🔹 Create the RTK Query API
export const profileSettingsApi = createApi({
  reducerPath: "profileSettingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev",
  }),
  endpoints: (builder) => ({
    editProfile: builder.mutation<EditProfileResponse, EditProfileRequest>({
      query: (body) => ({
        url: "/edit-profile",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      }),
    }),
  }),
});

// 🔹 Export hooks
export const { useEditProfileMutation } = profileSettingsApi;
