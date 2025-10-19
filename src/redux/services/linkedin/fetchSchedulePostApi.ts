import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface FetchSchedulePostRequest {
  sub: string;
  post_time: string;
}

interface FetchSchedulePostResponse {
  image_keys: string[]; // base64 strings from API
}

export const fetchSchedulePostApi = createApi({
  reducerPath: "fetchSchedulePostApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    fetchSchedulePost: builder.mutation<
      FetchSchedulePostResponse,
      FetchSchedulePostRequest
    >({
      query: (body) => ({
        url: "/fetch-schedule-post",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useFetchSchedulePostMutation } = fetchSchedulePostApi;
