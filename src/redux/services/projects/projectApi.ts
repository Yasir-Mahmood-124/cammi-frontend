import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface CreateProjectPayload {
  organization_name: string;
  project_name: string;
  session_id: string;
}

export interface GetSpecificOrganizationsPayload {
  session_id: string;
}

export interface GetSpecificProjectsPayload {
  organization_id: string;
}

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://o3uzr46ro5.execute-api.us-east-1.amazonaws.com/cammi-dev",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // API 1: Create Project
    createProject: builder.mutation<
      { message: string; organization_id: string; project_id: string },
      CreateProjectPayload
    >({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
    }),

    // API 2: Get Organizations of a specific user (needs session_id header)
    getSpecificOrganizations: builder.query<
      { message: string; organizations: any[] },
      GetSpecificOrganizationsPayload
    >({
      query: ({ session_id }) => ({
        url: "/getSpecific-organizations",
        method: "GET",
        headers: {
          session_id,
        },
      }),
    }),

    // API 3: Get Projects of a specific organization (needs organization_id header)
    getSpecificProjects: builder.query<
      { message: string; projects: any[] },
      GetSpecificProjectsPayload
    >({
      query: ({ organization_id }) => ({
        url: "/getSpecific-projects",
        method: "GET",
        headers: {
          organization_id,
        },
      }),
    }),
  }),
});

export const {
  useCreateProjectMutation,
  useGetSpecificOrganizationsQuery,
  useGetSpecificProjectsQuery,
} = projectsApi;
