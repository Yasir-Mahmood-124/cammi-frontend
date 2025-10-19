// redux/services/linkedin/linkedinLoginApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const linkedinLoginApi = createApi({
  reducerPath: "linkedinLoginApi",
  baseQuery: fetchBaseQuery({
    // baseUrl: "https://s248gcnoqb.execute-api.us-east-1.amazonaws.com/test/",
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/"
  }),
  endpoints: (builder) => ({
    getLoginUrl: builder.query<{ login_url: string }, void>({
      query: () => ({
        url: "linkedinlogin",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const { useGetLoginUrlQuery, useLazyGetLoginUrlQuery } = linkedinLoginApi;
