import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define the request and response types for better TypeScript safety
export interface ImageGenerationRequest {
  session_id: string;
  prompt: string;
}

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

// Export the auto-generated hook for using the mutation in components
export const { useGenerateImageMutation } = imageGenerationApi;