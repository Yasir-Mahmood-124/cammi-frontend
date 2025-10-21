// src/redux/services/linkedin/insertPostQuestion.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface InsertPostQuestionRequest {
  organization_id: string;
  post_question: string;
  post_answer: string;
}

interface InsertPostQuestionResponse {
  message: string;
  data: {
    id: string;
    organization_id: string;
    post_question: string;
    post_answer: string;
    created_at: string;
  };
}

export const insertPostQuestionApi = createApi({
  reducerPath: "insertPostQuestionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    insertPostQuestion: builder.mutation<
      InsertPostQuestionResponse,
      InsertPostQuestionRequest
    >({
      query: (body) => ({
        url: "insert-post-questions",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useInsertPostQuestionMutation } = insertPostQuestionApi;