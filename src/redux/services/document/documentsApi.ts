import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the Document type based on your API response
export interface UserDocument {
  id: string;
  name: string;
  // Add other fields from your API response as needed
  createdAt?: string;
  updatedAt?: string;
  // ... other fields
}

interface GetDocumentsRequest {
  session_id: string;
}

interface GetDocumentsResponse {
  documents: UserDocument[];
  // Add other response fields if any
}

export const documentsApi = createApi({
  reducerPath: 'documentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Documents'],
  endpoints: (builder) => ({
    getUserDocuments: builder.mutation<GetDocumentsResponse, GetDocumentsRequest>({
      query: (body) => ({
        url: '/get_all_documents_against_user',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Documents'],
    }),
  }),
});

export const { useGetUserDocumentsMutation } = documentsApi;