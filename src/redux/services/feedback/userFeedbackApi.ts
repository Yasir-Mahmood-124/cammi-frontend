// src/redux/services/feedback/userFeedbackApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface FeedbackRequest {
  session_id: string;
  questions: string[];
  answers: string[];
}

interface FeedbackResponse {
  message?: string;
  status?: string;
  [key: string]: any; // flexible for unknown response shape
}

export const userFeedbackApi = createApi({
  reducerPath: "userFeedbackApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/",
  }),
  endpoints: (builder) => ({
    sendUserFeedback: builder.mutation<FeedbackResponse, FeedbackRequest>({
      query: (feedbackData) => ({
        url: "user-feedback",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: feedbackData,
      }),
    }),
  }),
});

export const { useSendUserFeedbackMutation } = userFeedbackApi;
