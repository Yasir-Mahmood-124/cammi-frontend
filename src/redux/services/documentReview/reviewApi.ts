import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import Cookies from "js-cookie";

export interface Review {
  id: number;
  DocumentName: string;
  Organization: string;
  Date: string;
  Project: string;
  Status: string;
}

export const reviewApi = createApi({
  reducerPath: "reviewApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/",
  }),
  endpoints: (builder) => ({
    getReviews: builder.mutation<Review[], void>({
      // change to mutation for POST
      query: () => {
        const sessionId = Cookies.get("token");
        if (!sessionId) {
          console.warn("Session token not found in cookies!");
        }
        return {
          url: "get-specific-review-documents",
          method: "POST", // send body
          body: {
            session_id: sessionId,
          },
        };
      },
    }),
  }),
});

export const { useGetReviewsMutation } = reviewApi;

// export const { useGetReviewsQuery } = reviewApi;
