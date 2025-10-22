// src/redux/services/feedback/checkFeedbackApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Cookies from 'js-cookie';

export const checkFeedbackApi = createApi({
  reducerPath: 'checkFeedbackApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    checkFeedback: builder.mutation<any, void>({
      query: () => {
        const sessionId = Cookies.get('token'); // Get session_id from cookies
        return {
          url: 'check-feedback',
          method: 'POST',
          body: { session_id: sessionId }, // Pass session_id in body
        };
      },
    }),
  }),
});

export const { useCheckFeedbackMutation } = checkFeedbackApi;
