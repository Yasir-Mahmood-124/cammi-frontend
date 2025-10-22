// src/redux/services/webscrap/webscrapApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface WebScrapRequest {
  session_id: string;
  project_id: string;
  website: string;
}

interface WebScrapResponse {
  website: string;
  project_id: string;
  user_id: string;
  email: string;
  s3_url: string;
  model_id: string;
}

export const webscrapApi = createApi({
  reducerPath: 'webscrapApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'https://lmsnmdd3clmpphnqy2gmhsjkd40qdogs.lambda-url.us-east-1.on.aws/',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),

  endpoints: (builder) => ({
    postWebScrap: builder.mutation<WebScrapResponse, WebScrapRequest>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { usePostWebScrapMutation } = webscrapApi;
