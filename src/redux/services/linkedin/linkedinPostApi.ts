//redux/services/linkedin/linkedinPostApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface LinkedInPostRequest {
  sub: string;
  post_message: string;
  images?: { image: string }[]; // optional array of base64 images
}

export interface LinkedInPostResponse {
  success?: boolean;
  message?: string;
  id?: string;
  [key: string]: any; // allow other response fields without error
}

export const linkedinPostApi = createApi({
  reducerPath: "linkedinPostApi",
  baseQuery: fetchBaseQuery({
    // baseUrl: "https://s248gcnoqb.execute-api.us-east-1.amazonaws.com/test",
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createLinkedInPost: builder.mutation<
      LinkedInPostResponse,
      LinkedInPostRequest
    >({
      query: (body) => ({
        url: "text-post",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        console.log("API Response:", response);
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.error("API Error:", response);
        return response;
      },
    }),
  }),
});

// auto-generated hook
export const { useCreateLinkedInPostMutation } = linkedinPostApi;
