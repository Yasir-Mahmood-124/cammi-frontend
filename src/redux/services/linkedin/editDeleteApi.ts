import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface EditDeleteRequest {
  sub: string;
  post_time: string;
  action: "edit" | "delete";
  new_values?: {
    message?: string;
    status?: string;
    scheduled_time?: string;
    // add other editable fields if API allows more
  };
}

interface EditDeleteResponse {
  success: boolean;
  error?: string;
}

export const editDeleteApi = createApi({
  reducerPath: "editDeleteApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    editDelete: builder.mutation<EditDeleteResponse, EditDeleteRequest>({
      query: (body) => ({
        url: "/edit-delete",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useEditDeleteMutation } = editDeleteApi;
