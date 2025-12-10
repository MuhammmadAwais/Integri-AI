import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }), // Base URL ignored due to mock queryFn
  endpoints: (builder) => ({
    login: builder.mutation({
      // MOCK BACKEND LOGIC
      queryFn: async (credentials) => {
        //NETWORK DELAY SIMULATION IS ONLY FOR DEVELOPENMENT PURPOSES
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
        // Simulate success
        if (credentials.email && credentials.password.length >= 6) {
          return {
            data: {
              user: {
                id: "1",
                name: "Integri User",
                email: credentials.email,
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
              },
              token: "mock-jwt-token-xyz-123",
            },
          };
        }
        return { error: { status: 400, data: "Invalid credentials" } };
      },
    }),
    signup: builder.mutation({
      // MOCK BACKEND LOGIC
      queryFn: async (userData) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return {
          data: {
            user: {
              id: Date.now().toString(),
              name: userData.name,
              email: userData.email,
            },
            token: "mock-jwt-token-new-user",
          },
        };
      },
    }),
  }),
});

export const { useLoginMutation, useSignupMutation } = authApi;
