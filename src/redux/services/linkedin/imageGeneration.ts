// src/redux/services/linkedin/imageGeneration.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define image type
export interface ImageData {
  mime_type: string;
  data: string; // base64 data URL
}

// Define the request type (prompt and images are optional)
export interface ImageGenerationRequest {
  session_id: string;
  prompt?: string;
  images?: ImageData[];
}

// Define the response type
export interface ImageGenerationResponse {
  session_id: string;
  remaining_credits: number;
  image_base64: string;
}

// Create the RTK Query API slice
export const imageGenerationApi = createApi({
  reducerPath: "imageGenerationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev",
  }),
  endpoints: (builder) => ({
    generateImage: builder.mutation<ImageGenerationResponse, ImageGenerationRequest>({
      query: (body) => ({
        url: "/image-generation",
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

// Export the auto-generated hook
export const { useGenerateImageMutation } = imageGenerationApi;