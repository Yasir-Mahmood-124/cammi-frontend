import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface DocumentItem {
  document_name: string;
  user_id: string;
  document_type: string;
  created_at: string;
  document_url: string;
  document_type_uuid: string;
  project_id: string;
}

interface GetDocumentResponse {
  session_id: string;
  user_id: string;
  document_history: DocumentItem[];
}

interface GetDocumentRequest {
  session_id: string;
}

export const getDocumentAgainstUserApi = createApi({
  reducerPath: "getDocumentAgainstUserApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getDocumentAgainstUser: builder.mutation<GetDocumentResponse, GetDocumentRequest>({
      query: (body) => ({
        url: "get_all_documents_against_user",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useGetDocumentAgainstUserMutation } = getDocumentAgainstUserApi;
