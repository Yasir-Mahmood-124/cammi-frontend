//redux/services/common/refineApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface RefineRequest {
  prompt: string;
  session_id?: string;
}

interface RefineResponse {
  message: string;
  session_id?: string;
  groq_response: string;
}

export const refineApi = createApi({
  reducerPath: "refineApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://ogcvp659ah.execute-api.us-east-1.amazonaws.com/cammi-refine/",
  }),
  endpoints: (builder) => ({
    refine: builder.mutation<RefineResponse, RefineRequest>({
      query: (body) => ({
        url: "refine", // if baseUrl already ends with /, no need to add it here
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const { useRefineMutation } = refineApi;
