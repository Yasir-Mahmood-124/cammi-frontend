//src/redux/services/document/deleteDocumentApi.ts

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface DeleteDocumentRequest {
  user_id: string;
  document_type_uuid: string;
}

export interface DeleteDocumentResponse {
  message: string;
  deleted_item: {
    user_id: string;
    document_type_uuid: string;
    document_name: string;
    document_url: string;
  };
}

export const deleteDocumentApi = createApi({
  reducerPath: "deleteDocumentApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    deleteDocument: builder.mutation<
      DeleteDocumentResponse,
      DeleteDocumentRequest
    >({
      query: (body) => ({
        url: `/delete-document`,
        method: "DELETE",
        body,
      }),
    }),
  }),
});

export const { useDeleteDocumentMutation } = deleteDocumentApi;
