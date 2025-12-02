import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Chat {
  id: string;
  title: string;
  date: string;
  preview: string;
}

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3005" }), 
  tagTypes: ["Chat"],
  endpoints: (builder) => ({
    getChats: builder.query<Chat[], void>({
      query: () => "/chats",
      providesTags: ["Chat"],
    }),
    addChat: builder.mutation<Chat, Partial<Chat>>({
      query: (body) => ({
        url: "/chats",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chat"],
    }),
    deleteChat: builder.mutation<void, string>({
      query: (id) => ({
        url: `/chats/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chat"],
    }),
  }),
});

export const { useGetChatsQuery, useAddChatMutation, useDeleteChatMutation } =
  chatApi;
