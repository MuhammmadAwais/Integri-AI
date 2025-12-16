import { useState, useEffect, useCallback } from "react";
import { socketService } from "../../../services/WebSocketsService";
import { SessionService } from "../../../api/backendApi";
import { useAppSelector } from "../../../hooks/useRedux";

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

// 1. GLOBAL EVENT TRIGGER (Ensures Sidebar updates when History deletes)
export const triggerChatUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("chat-updated"));
  }
};

// --- HOOK FOR CHAT LIST (SIDEBAR & HISTORY) ---
export const useChatList = (userId?: string) => {
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
      // Ensure we treat the response correctly based on backend structure
      const sessionList = Array.isArray(data) ? data : data.items || [];
      setChats(sessionList);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 2. SYNC LISTENER (Updates list when 'chat-updated' fires)
  useEffect(() => {
    fetchChats();

    const handleUpdate = () => fetchChats();
    window.addEventListener("chat-updated", handleUpdate);

    return () => {
      window.removeEventListener("chat-updated", handleUpdate);
    };
  }, [fetchChats]);

  const handleDeleteChat = async (sessionId: string) => {
    if (!token) return;
    try {
      // Optimistic Update: Remove immediately from UI
      setChats((prev) =>
        prev.filter((c) => (c.session_id || c.id) !== sessionId)
      );

      // Call Backend
      await SessionService.deleteSession(token, sessionId);

      // Trigger Sync for other components
      triggerChatUpdate();
    } catch (error) {
      console.error("Failed to delete session", error);
      // Revert/Refetch on error
      fetchChats();
    }
  };

  return { chats, loading, refreshChats: fetchChats, handleDeleteChat };
};

// --- HOOK FOR ACTIVE CHAT ---
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

  // Listen for Stream
  useEffect(() => {
    socketService.onMessage((data) => {
      if (data.type === "stream") {
        setIsStreaming(true);
        if (data.done) {
          setIsStreaming(false);
          triggerChatUpdate(); // Refresh sidebar title
          return;
        }

        const incomingText =
          data.content || data.chunk || data.text || data.token || "";
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
      socketService.sendMessage(content, currentModel || "gpt-4o");
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
