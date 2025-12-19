import { useState, useEffect, useCallback } from "react";
import { socketService } from "../../../services/WebSocketsService";
import { SessionService } from "../../../api/backendApi";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import { setActiveSessionConfig } from "../chatSlice";

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

// 1. GLOBAL EVENT TRIGGER
export const triggerChatUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("chat-updated"));
  }
};

// --- HOOK FOR CHAT LIST (SIDEBAR & HISTORY) ---
export const useChatList = (userId?: string) => {
  {
    userId;
  }
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAppSelector((state: any) => state.auth.accessToken);

  const fetchChats = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await SessionService.getSessions(token);
      const sessionList = Array.isArray(data) ? data : data.items || [];
      const sorted = sessionList.sort(
        (a: any, b: any) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );
      setChats(sorted);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchChats();
    const handleUpdate = () => fetchChats();
    window.addEventListener("chat-updated", handleUpdate);
    return () => window.removeEventListener("chat-updated", handleUpdate);
  }, [fetchChats]);

  const handleDeleteChat = async (sessionId: string) => {
    if (!token) return;
    const previousChats = [...chats];
    setChats((prev) =>
      prev.filter((c) => (c.session_id || c.id) !== sessionId)
    );

    try {
      await SessionService.deleteSession(token, sessionId);
      triggerChatUpdate();
    } catch (error) {
      console.error("Failed to delete session, reverting UI", error);
      setChats(previousChats);
      fetchChats();
    }
  };

  return { chats, loading, refreshChats: fetchChats, handleDeleteChat };
};

// --- HOOK FOR ACTIVE CHAT (SINGLE MODE) ---
export const useChat = (sessionId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const dispatch = useAppDispatch();
  const token = useAppSelector((state: any) => state.auth.accessToken);

  // Use specific selectors
  const activeConfig = useAppSelector(
    (state: any) => state.chat.activeSessionConfig
  );
  const newChatPref = useAppSelector((state: any) => state.chat.newChatModel);

  // Initialize Chat (Load Messages & Config)
  useEffect(() => {
    if (!sessionId || !token) {
      setMessages([]);
      return;
    }

    const initChat = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Messages
        const history = await SessionService.getSessionMessages(
          token,
          sessionId
        );
        setMessages(history);

        // 2. Fetch Session Details (Lock the model/provider)
        // Try to find in cache first or fetch fresh
        try {
          const details = await SessionService.getSession(token, sessionId);
          if (details) {
            dispatch(
              setActiveSessionConfig({
                modelId: details.model,
                provider: details.provider,
              })
            );
          }
        } catch (e) {
          console.warn(
            "Could not fetch session details, UI might be desync",
            e
          );
        }

        // 3. Connect Socket
        socketService.connect(token, sessionId);
      } catch (error) {
        console.error("❌ Error initializing chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
    return () => socketService.disconnect();
  }, [sessionId, token, dispatch]);

  // Stream Listener
  useEffect(() => {
    socketService.onMessage((data) => {
      if (data.type === "stream") {
        setIsStreaming(true);
        if (data.done) {
          setIsStreaming(false);
          triggerChatUpdate();
          return;
        }

        const incomingText = data.content || data.chunk || data.text || "";
        if (!incomingText) return;

        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, content: lastMsg.content + incomingText },
            ];
          } else {
            return [...prev, { role: "assistant", content: incomingText }];
          }
        });
      }
    });
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      setMessages((prev) => [...prev, { role: "user", content }]);

      // LOGIC: Use Active Session Config if exists, otherwise New Chat Pref
      const modelToUse =
        sessionId && activeConfig ? activeConfig.modelId : newChatPref.id;
      const providerToUse =
        sessionId && activeConfig
          ? activeConfig.provider
          : newChatPref.provider;

      console.log(`🚀 Sending (${providerToUse}/${modelToUse}):`, content);

      socketService.sendMessage(content, modelToUse, providerToUse);
    },
    [sessionId, activeConfig, newChatPref]
  );

  const deleteMessage = async (messageId: string) => {
    if (!token || !messageId) return;
    try {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      await SessionService.deleteMessage(token, messageId);
    } catch (err) {
      console.error("Failed to delete message", err);
    }
  };

  return { messages, sendMessage, deleteMessage, isLoading, isStreaming };
};
