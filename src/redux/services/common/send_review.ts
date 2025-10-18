// src/redux/services/common/send_review.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the request body type
export interface SendReviewRequest {
  session_id: string;
  project_id: string;
  document_type: string;
  document_text: string;
}

// Define the response type
export interface SendReviewResponse {
  message: string;
  document_type_uuid: string;
  s3_url: string;
}

// Base URL of your API
const BASE_URL =
  "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev";

export const sendReviewApi = createApi({
  reducerPath: "sendReviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    sendReviewDocument: builder.mutation<SendReviewResponse, SendReviewRequest>({
      query: (body) => ({
        url: "/add-review-document",
        method: "POST",
        body,
      }),
    }),
  }),
});

// Export the mutation hook
export const { useSendReviewDocumentMutation } = sendReviewApi;
