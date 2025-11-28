import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface DocumentInfoRequest {
  user_id: string;
  document_type_uuid: string;
}

export interface DocumentInfoResponse {
  organization_name: string;
  project_name: string;
  document_name: string;
  document_type: string;
  created_at: string;
  user_name: string;
}

export const documentInfoApi = createApi({
  reducerPath: "documentInfoApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    documentInfo: builder.mutation<
      DocumentInfoResponse,
      DocumentInfoRequest
    >({
      query: (body) => ({
        url: `/document-info`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useDocumentInfoMutation } = documentInfoApi;
