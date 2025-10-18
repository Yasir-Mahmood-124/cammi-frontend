// src/redux/services/common/addQuestion.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

interface AddQuestionRequest {
  question_text: string;
  answer_text: string;
  document_type?: string;
}

interface AddQuestionResponse {
  message: string;
  question_id: string;
  document_type?: string;
}

export const addQuestionApi = createApi({
  reducerPath: "addQuestionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev",
    prepareHeaders: (headers) => {
      const token = Cookies.get("token");
    //   const token = "1591e566-ab7c-4fd6-9c36-192305fa090b";
    //   const project_id = "5b0acee1-3b13-4905-a24b-f084bb74a36d";
      const project = localStorage.getItem("currentProject");

      if (token) {
        headers.set("session_id", token);
      }

      if (project) {
        try {
          const parsed = JSON.parse(project);
          if (parsed.project_id) {
            headers.set("project_id", parsed.project_id);
            // headers.set("project_id", project_id);
          }
        } catch (err) {
          console.error("Error parsing currentProject from localStorage:", err);
        }
      }

      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    addQuestion: builder.mutation<AddQuestionResponse, AddQuestionRequest>({
      query: (body) => ({
        url: "/add-question",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useAddQuestionMutation } = addQuestionApi;
