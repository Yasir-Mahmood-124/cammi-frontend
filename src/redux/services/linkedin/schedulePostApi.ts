// redux/services/linkedin/schedulePostApi.ts 
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface SchedulePostRequest {
  sub: string;
  message: string;
  scheduled_time: string;
  images?: { image: string }[]; // optional base64 images
}

export interface SchedulePostResponse {
  message: string;
  scheduled_time_pkt: string;
  scheduled_time_utc: string;
  schedule_name: string;
  id?: string; // if backend returns post id
  [key: string]: any; // allow extra fields without error
}

export const schedulePostApi = createApi({
  reducerPath: "schedulePostApi",
  baseQuery: fetchBaseQuery({
    // baseUrl: "https://s248gcnoqb.execute-api.us-east-1.amazonaws.com/test/",
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    schedulePost: builder.mutation<SchedulePostResponse, SchedulePostRequest>({
      query: (body) => ({
        url: "schedule-status",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => {
        console.log("Schedule API Response:", response);
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.error("Schedule API Error:", response);
        return response;
      },
    }),
  }),
});

export const { useSchedulePostMutation } = schedulePostApi;
