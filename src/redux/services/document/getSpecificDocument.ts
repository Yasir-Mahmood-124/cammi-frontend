// src/redux/services/document/getSpecificDocument.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface GetSpecificDocumentRequest {
  user_id: string;
  document_type_uuid: string;
}

export interface GetSpecificDocumentResponse {
  user_id: string;
  document_type_uuid: string;
  document_url: string;
  document_base64: string;
}

export const getSpecificDocumentApi = createApi({
  reducerPath: "getSpecificDocumentApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev",
  }),

  endpoints: (builder) => ({
    getSpecificDocument: builder.mutation<
      GetSpecificDocumentResponse,
      GetSpecificDocumentRequest
    >({
      query: (body) => ({
        url: "/get_specific_document_against_user",
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const { useGetSpecificDocumentMutation } = getSpecificDocumentApi;
