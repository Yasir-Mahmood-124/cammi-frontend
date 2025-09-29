// redux/services/auth/authApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { LoginResponse, LoginRequest } from "@/types/auth";
const BASE_URL =
  "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // ✅ Register now accepts firstName + lastName
    register: builder.mutation<
      { message: string },
      { firstName: string; lastName: string; email: string; password: string }
    >({
      query: (body) => ({ url: "/register", method: "POST", body }),
    }),

    // ✅ VerifyEmail response updated with firstName + lastName if backend returns them
    verifyEmail: builder.mutation<
      {
        message: string;
        user: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
        };
      },
      { email: string; code: string }
    >({
      query: (body) => ({ url: "/verify-email", method: "POST", body }),
    }),

    // ✅ Login response updated with full user info
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: "/login", method: "POST", body }),
    }),

    googleLogin: builder.mutation<LoginResponse, { tokenId: string }>({
      query: (body) => ({
        url: "/google-login",
        method: "POST",
        body, // { tokenId } from Google OAuth
      }),
    }),

    logout: builder.mutation<{ message: string }, { token: string }>({
      query: ({ token }) => ({
        url: "/logout",
        method: "POST",
        body: { token },
      }),
    }),

    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({ url: "/forgot-password", method: "POST", body }),
    }),

    resetPassword: builder.mutation<
      { message: string },
      {
        email: string;
        code: string;
        newPassword: string;
        confirmPassword: string;
      }
    >({
      query: (body) => ({ url: "/reset-password", method: "POST", body }),
    }),

    verifyCode: builder.mutation<
      { message: string },
      { email: string; code: string }
    >({
      query: (body) => ({
        url: "/verify-code",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useVerifyEmailMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyCodeMutation,
  useGoogleLoginMutation,
} = authApi;
