//src/redux/document/editDocumentNameApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface EditDocumentNameRequest {
  user_id: string;
  document_type_uuid: string;
  document_name: string;
}

export interface EditDocumentNameResponse {
  message: string;
  updated_item: {
    user_id: string;
    document_type_uuid: string;
    old_document_name: string;
    new_document_name: string;
    old_document_url: string;
    new_document_url: string;
  };
}

export const editDocumentNameApi = createApi({
  reducerPath: "editDocumentNameApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    editDocumentName: builder.mutation<
      EditDocumentNameResponse,
      EditDocumentNameRequest
    >({
      query: (body) => ({
        url: `/edit-document-name`,
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const { useEditDocumentNameMutation } = editDocumentNameApi;
