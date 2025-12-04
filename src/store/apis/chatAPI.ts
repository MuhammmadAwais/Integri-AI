import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export interface Chat {
  id: string;
  userId: string; // <--- Critical for data isolation
  title: string;
  date: string;
  preview: string;
  model?: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:3005",
    prepareHeaders: (headers, { getState }) => {
      // Optional: if you have a real backend, attach token here
      return headers;
    },
  }),
  tagTypes: ["Chat", "Message"],
  endpoints: (builder) => ({
    // 1. Get Chats (Filtered by Logged In User)
    getChats: builder.query<Chat[], string>({
      query: (userId) => `/chats?userId=${userId}&_sort=date&_order=desc`,
      providesTags: ["Chat"],
    }),

    // 2. Create Chat
    addChat: builder.mutation<Chat, Partial<Chat>>({
      query: (body) => ({
        url: "/chats",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chat"],
    }),

    // 3. Delete Chat
    deleteChat: builder.mutation<void, string>({
      query: (id) => ({
        url: `/chats/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Chat"],
    }),

    // 4. Get Messages for a specific Chat
    getMessages: builder.query<Message[], string>({
      query: (chatId) =>
        `/messages?chatId=${chatId}&_sort=timestamp&_order=asc`,
      providesTags: ["Message"],
    }),

    // 5. Add Message
    addMessage: builder.mutation<Message, Partial<Message>>({
      query: (body) => ({
        url: "/messages",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Message"],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useAddChatMutation,
  useDeleteChatMutation,
  useGetMessagesQuery,
  useAddMessageMutation,
} = chatApi;
