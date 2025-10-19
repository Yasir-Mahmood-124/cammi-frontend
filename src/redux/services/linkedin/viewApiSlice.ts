// redux/services/linkedin/viewApiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the API slice
export const viewApiSlice = createApi({
  reducerPath: 'viewApi', // unique key for this API in the store
  baseQuery: fetchBaseQuery({
    // baseUrl: 'https://s248gcnoqb.execute-api.us-east-1.amazonaws.com/test/',
    baseUrl: 'https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/',
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getPosts: builder.mutation<any[], { sub: string }>({
      query: (body) => ({
        url: 'view-posts',
        method: 'POST',
        body, // body = { sub: 'ax-rDwh420' }
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const { useGetPostsMutation } = viewApiSlice;