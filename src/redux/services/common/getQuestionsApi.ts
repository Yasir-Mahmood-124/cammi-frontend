// src/redux/services/common/getQuestionsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface Question {
  question_id: string;
  question_text: string;
  answer_text?: string;
  status: string;
  user_id: string;
  project_id: string;
  createdAt: string;
  updatedAt: string;
}

interface GetQuestionsResponse {
  questions: Question[];
  document_type: string;
}

export const getQuestionsApi = createApi({
  reducerPath: "getQuestionsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/",
  }),
  endpoints: (builder) => ({
    getQuestions: builder.query<GetQuestionsResponse, { project_id: string; document_type: string }>({
      query: ({ project_id, document_type }) => ({
        url: "/get-questions",
        method: "GET",
        headers: {
          project_id,
          document_type,
        },
      }),
    }),
  }),
});

export const { useGetQuestionsQuery } = getQuestionsApi;
