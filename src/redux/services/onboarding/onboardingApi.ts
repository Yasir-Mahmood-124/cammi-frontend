import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const onboardingApi = createApi({
  reducerPath: "onboardingApi",
  baseQuery: fetchBaseQuery({
    baseUrl:
      "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev/",
  }),
  endpoints: (builder) => ({
    // Submit answer mutation
    submitAnswer: builder.mutation({
      query: ({ session_id, question, answer }) => ({
        url: "onboarding",
        method: "POST",
        body: { session_id, question, answer },
      }),
    }),
  }),
});

export const { useSubmitAnswerMutation } = onboardingApi;
