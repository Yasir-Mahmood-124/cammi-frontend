import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface GoogleLoginResponse {
  user: string;
  login_url: string;
  state: string;
  session_id?: string;
  email: string;
  name: string;
  access_token?: string;
  id?: string;
}

// export const googleApi = createApi({
//   reducerPath: "googleApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: "https://masefjwzpi.execute-api.us-east-1.amazonaws.com/test/",
//   }),
//   endpoints: (builder) => ({
//     googleLogin: builder.query<GoogleLoginResponse, void>({
//       query: () => "login", // GET by default
//     }),
//     googleCallback: builder.mutation<
//       GoogleCallbackResponse,
//       { code: string; state: string }
//     >({
//       query: ({ code, state }) => ({
//         url: "callback",
//         method: "POST",
//         body: { code, state },
//       }),
//     }),
//   }),
// });

export const googleApi = createApi({
  reducerPath: "googleApi",
  baseQuery: fetchBaseQuery({
    // https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/google-login
    baseUrl:
      "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/",

    // baseUrl: "https://masefjwzpi.execute-api.us-east-1.amazonaws.com/test/",
  }),
  endpoints: (builder) => ({
    googleLogin: builder.query<GoogleLoginResponse, void>({
      query: () => "google-login",
    }),
  }),
});

// export const { useLazyGoogleLoginQuery, useLazyGoogleCallbackQuery } =
//   googleApi;

export const { useLazyGoogleLoginQuery } = googleApi;
