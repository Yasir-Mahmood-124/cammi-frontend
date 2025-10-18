//redux/services/common/uploadApiSlice

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const uploadApiSlice = createApi({
  reducerPath: 'uploadApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/',
    // credentials: "include",
  }),
  endpoints: (builder) => ({
    uploadTextFile: builder.mutation({
      query: (body) => ({
        url: 'upload-to-s3',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body,
      }),
    }),
  }),
});

export const { useUploadTextFileMutation } = uploadApiSlice;