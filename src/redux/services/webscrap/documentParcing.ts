//src/redux/services/webscrap/documentParcing.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ✅ Define request body type
interface DocumentParsingRequest {
  session_id: string;
  filename: string;
  project_id: string;
}

// ✅ Define response type
interface DocumentParsingResponse {
  upload_url: string;
  s3_path: string;
  file_name: string;
  session_id: string;
}

// ✅ Create API slice
export const documentParsingApi = createApi({
  reducerPath: "documentParsingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev",
  }),
  endpoints: (builder) => ({
    // POST request to frontend-to-s3 endpoint
    getUploadUrl: builder.mutation<DocumentParsingResponse, DocumentParsingRequest>({
      query: (body) => ({
        url: "/frontend-to-s3",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      }),
    }),
  }),
});

// ✅ Export hooks for usage in components
export const { useGetUploadUrlMutation } = documentParsingApi;
