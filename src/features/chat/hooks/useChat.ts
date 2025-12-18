import { useState, useEffect, useCallback } from "react";
import { socketService } from "../../../services/WebSocketsService";
import { SessionService } from "../../../api/backendApi";
import { useAppSelector } from "../../../hooks/useRedux";
import AVAILABLE_MODELS from "../../../../Constants";// Correct path to src/Constants.ts

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

// 1. GLOBAL EVENT TRIGGER (Syncs Sidebar & Playground)
export const triggerChatUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("chat-updated"));
  }
};

// --- HOOK FOR CHAT LIST (SIDEBAR & HISTORY) ---
export const useChatList = (userId?: string) => {
  {
    userId;
  } // Prevent unused var warning if applicable
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
      // Handle both array or paginated object response
      const sessionList = Array.isArray(data) ? data : data.items || [];

      // Sort by newest first
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

  // Sync Listener (Listens for 'chat-updated' event)
  useEffect(() => {
    fetchChats();
    const handleUpdate = () => fetchChats();
    window.addEventListener("chat-updated", handleUpdate);
    return () => window.removeEventListener("chat-updated", handleUpdate);
  }, [fetchChats]);

  // FIX: Robust Delete Handler
  const handleDeleteChat = async (sessionId: string) => {
    if (!token) return;

    // 1. Optimistic Update (Remove immediately from UI)
    const previousChats = [...chats];
    setChats((prev) =>
      prev.filter((c) => (c.session_id || c.id) !== sessionId)
    );

    try {
      // 2. API Call
      await SessionService.deleteSession(token, sessionId);

      // 3. Trigger Global Update (Ensure other components know)
      triggerChatUpdate();
    } catch (error) {
      console.error("Failed to delete session, reverting UI", error);
      // Revert if failed
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

  const token = useAppSelector((state: any) => state.auth.accessToken);
  const currentModel = useAppSelector((state: any) => state.chat.currentModel);

  // Initialize Chat
  useEffect(() => {
    if (!sessionId || !token) return;

    const initChat = async () => {
      setIsLoading(true);
      try {
        const history = await SessionService.getSessionMessages(
          token,
          sessionId
        );
        setMessages(history);
        socketService.connect(token, sessionId);
      } catch (error) {
        console.error("❌ Error initializing chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
    return () => socketService.disconnect();
  }, [sessionId, token]);

  // Stream Listener
  useEffect(() => {
    socketService.onMessage((data) => {
      if (data.type === "stream") {
        setIsStreaming(true);
        if (data.done) {
          setIsStreaming(false);
          triggerChatUpdate(); // Refresh title when done
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

      const modelId = currentModel || "gpt-5.1";

      // LOOKUP PROVIDER
      const selectedModel = AVAILABLE_MODELS.find((m) => m.id === modelId);
      const provider = selectedModel ? selectedModel.provider : "openai";

      socketService.sendMessage(content, modelId, provider);
    },
    [currentModel]
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
