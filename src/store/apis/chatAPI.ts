import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Chat {
  id: string;
  userId: string;
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

export interface AIModel {
  id: string;
  label: string;
  provider: string;
  icon: string;
  color: string;
}

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3005" }),
  tagTypes: ["Chat", "Message", "Model"],
  endpoints: (builder) => ({
    // --- CHATS ---
    getChats: builder.query<Chat[], string>({
      query: (userId) => `/chats?userId=${userId}&_sort=date&_order=desc`,
      providesTags: ["Chat"],
    }),
    addChat: builder.mutation<Chat, Partial<Chat>>({
      query: (body) => ({ url: "/chats", method: "POST", body }),
      invalidatesTags: ["Chat"],
    }),
    deleteChat: builder.mutation<void, string>({
      query: (id) => ({ url: `/chats/${id}`, method: "DELETE" }),
      invalidatesTags: ["Chat"],
    }),

    // --- MESSAGES ---
    getMessages: builder.query<Message[], string>({
      query: (chatId) =>
        `/messages?chatId=${chatId}&_sort=timestamp&_order=asc`,
      providesTags: ["Message"],
    }),
    addMessage: builder.mutation<Message, Partial<Message>>({
      query: (body) => ({ url: "/messages", method: "POST", body }),
      invalidatesTags: ["Message"],
    }),

    // --- MODELS ---
    getModels: builder.query<AIModel[], void>({
      query: () => "/models",
      providesTags: ["Model"],
    }),
  }),
});

export const {
  useGetChatsQuery,
  useAddChatMutation,
  useDeleteChatMutation,
  useGetMessagesQuery,
  useAddMessageMutation,
  useGetModelsQuery, // New Hook
} = chatApi;
