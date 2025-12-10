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

// --- HELPERS ---
const getLocalData = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const setLocalData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize
if (!localStorage.getItem("integri-chats")) setLocalData("integri-chats", []);
if (!localStorage.getItem("integri-messages"))
  setLocalData("integri-messages", []);

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Chat", "Message", "Model"],
  endpoints: (builder) => ({
    getChats: builder.query<Chat[], string>({
      queryFn: async (userId) => {
        await new Promise((r) => setTimeout(r, 10)); // Tiny delay for UI stability
        const allChats = getLocalData("integri-chats");
        const userChats = allChats
          .filter((c: Chat) => c.userId === userId)
          .sort(
            (a: Chat, b: Chat) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        return { data: userChats };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Chat" as const, id })),
              { type: "Chat", id: "LIST" },
            ]
          : [{ type: "Chat", id: "LIST" }],
    }),

    addChat: builder.mutation<Chat, Partial<Chat>>({
      queryFn: async (newChat) => {
        const chats = getLocalData("integri-chats");
        if (chats.some((c: Chat) => c.id === newChat.id)) {
          return { data: newChat as Chat };
        }
        const updatedChats = [newChat, ...chats];
        setLocalData("integri-chats", updatedChats);
        return { data: newChat as Chat };
      },
      invalidatesTags: [{ type: "Chat", id: "LIST" }],
    }),

    deleteChat: builder.mutation<void, string>({
      queryFn: async (chatId) => {
        const chats = getLocalData("integri-chats");
        const updatedChats = chats.filter((c: Chat) => c.id !== chatId);
        setLocalData("integri-chats", updatedChats);

        const msgs = getLocalData("integri-messages");
        const updatedMsgs = msgs.filter((m: Message) => m.chatId !== chatId);
        setLocalData("integri-messages", updatedMsgs);

        return { data: undefined };
      },
      invalidatesTags: [{ type: "Chat", id: "LIST" }],
    }),

    getMessages: builder.query<Message[], string>({
      queryFn: async (chatId) => {
        const allMsgs = getLocalData("integri-messages");
        const chatMsgs = allMsgs
          .filter((m: Message) => m.chatId === chatId)
          .sort((a: Message, b: Message) => a.timestamp - b.timestamp);
        return { data: chatMsgs };
      },
      providesTags: (result, error, chatId) => {
        if (result) {
          return [
            ...result.map(({ id }) => ({ type: "Message" as const, id })),
            { type: "Message", id: chatId },
          ];
        }
        else if (error) {
          console.error(error);
        }
        return [{ type: "Message", id: chatId }];
      },
    }),

    addMessage: builder.mutation<Message, Partial<Message>>({
      queryFn: async (newMsg) => {
        // 1. Save Message
        const msgs = getLocalData("integri-messages");
        const updatedMsgs = [...msgs, newMsg];
        setLocalData("integri-messages", updatedMsgs);

        // 2. UPDATE PARENT CHAT (Critical for Sidebar Sync)
        const chats = getLocalData("integri-chats");
        const chatIndex = chats.findIndex((c: Chat) => c.id === newMsg.chatId);

        if (chatIndex !== -1) {
          // Update preview and timestamp so it moves to top
          chats[chatIndex].preview =
            newMsg.content?.slice(0, 50) || "New message";
          chats[chatIndex].date = new Date().toISOString();
          setLocalData("integri-chats", chats);
        }

        return { data: newMsg as Message };
      },
      // Invalidate BOTH the specific chat messages AND the sidebar list
      invalidatesTags: (result, error, { chatId }) => {
        if (result) {
          // Use the result variable here
          console.log(result);
        } else if (error) {
          // Handle the error case
          console.error(error);
        }
        return [
          { type: "Message", id: chatId },
          { type: "Chat", id: "LIST" },
        ];
      },
    }),

    getModels: builder.query<AIModel[], void>({
      queryFn: async () => {
        return {
          data: [
            {
              id: "gpt-4o",
              label: "GPT-4o",
              provider: "OpenAI",
              icon: "Sparkles",
              color: "text-purple-500 bg-purple-500/10",
            },
            {
              id: "gpt-4o-mini",
              label: "GPT-4o Mini",
              provider: "OpenAI",
              icon: "Zap",
              color: "text-yellow-500 bg-yellow-500/10",
            },
            {
              id: "claude-3-5-sonnet",
              label: "Claude 3.5",
              provider: "Anthropic",
              icon: "Box",
              color: "text-orange-500 bg-orange-500/10",
            },
            {
              id: "Grok-Beta",
              label: "Grok Beta",
              provider: "xAI",
              icon: "Rocket",
              color: "text-blue-500 bg-blue-500/10",
            },
          ],
        };
      },
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
  useGetModelsQuery,
} = chatApi;
