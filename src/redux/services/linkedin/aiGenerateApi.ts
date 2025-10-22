//redux/services/linkedin/aiGenerateApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface AIGenerateRequest {
  prompt: string;
  organization_id: string;
  session_id: string;
}

interface AIGenerateResponse {
  message: string;
  final_response: string;
}

export const aiGenerateApi = createApi({
  reducerPath: "aiGenerateApi",
  baseQuery: fetchBaseQuery({
    // baseUrl: "https://s248gcnoqb.execute-api.us-east-1.amazonaws.com/test/",
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/",
  }),
  endpoints: (builder) => ({
    generateIdea: builder.mutation<AIGenerateResponse, AIGenerateRequest>({
      query: (body) => ({
        url: "idea-generate",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      }),
    }),
  }),
});

export const { useGenerateIdeaMutation } = aiGenerateApi;
