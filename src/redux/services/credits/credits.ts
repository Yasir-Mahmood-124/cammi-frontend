// src/redux/services/credits/credits.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// 🔹 Define the response type
interface CreditsResponse {
  total_credits: number;
}

// 🔹 Define the request body type
interface CreditsRequest {
  session_id: string;
}

// 🔹 Create the RTK Query API
export const creditsApi = createApi({
  reducerPath: "creditsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    updateTotalCredits: builder.mutation<CreditsResponse, CreditsRequest>({
      query: (body) => ({
        url: "total_credits_update",
        method: "POST",
        body,
      }),
    }),
  }),
});

// 🔹 Export the hook
export const { useUpdateTotalCreditsMutation } = creditsApi;