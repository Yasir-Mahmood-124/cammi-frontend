
// src/redux/services/common/getUnansweredQuestionsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface GetUnansweredQuestionsResponse {
  missing_questions: string[];
}

export const getUnansweredQuestionsApi = createApi({
  reducerPath: "getUnansweredQuestionsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev",
  }),
  endpoints: (builder) => ({
    get_unanswered_questions: builder.query<
      GetUnansweredQuestionsResponse,
      { project_id: string; document_type: string }
    >({
      query: ({ project_id, document_type }) => ({
        url: "/get-unanswered-questions",
        method: "GET",
        headers: {
          project_id,
          document_type,
        },
      }),
    }),
  }),
});

// ✅ Export hook
export const { useGet_unanswered_questionsQuery } = getUnansweredQuestionsApi;
