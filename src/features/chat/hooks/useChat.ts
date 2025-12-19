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

// Helper to trigger updates across components (e.g., Sidebar)
export const triggerChatUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("chat-updated"));
  }
};

// --- HOOK 1: Sidebar List ---
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
      // Sort: Newest first
      const sorted = (data || []).sort(
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

  // Listen for deletions/creations
  useEffect(() => {
    fetchChats();
    const handleUpdate = () => setTimeout(fetchChats, 300); // Delay for backend sync
    window.addEventListener("chat-updated", handleUpdate);
    return () => window.removeEventListener("chat-updated", handleUpdate);
  }, [fetchChats]);

  const handleDeleteChat = async (sessionId: string) => {
    if (!token) return;

    // Optimistic Update
    const prevChats = [...chats];
    setChats((prev) =>
      prev.filter((c) => (c.session_id || c.id) !== sessionId)
    );

    try {
      await SessionService.deleteSession(token, sessionId);
      triggerChatUpdate();
    } catch (error) {
      console.error("Failed to delete", error);
      setChats(prevChats); // Revert
    }
  };

  return { chats, loading, refreshChats: fetchChats, handleDeleteChat };
};

// --- HOOK 2: Single Chat ---
export const useChat = (sessionId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false); // UI State
  const [isStreaming, setIsStreaming] = useState(false);

  const dispatch = useAppDispatch();
  const token = useAppSelector((state: any) => state.auth.accessToken);

  // Selectors
  const activeConfig = useAppSelector(
    (state: any) => state.chat.activeSessionConfig
  );
  const newChatPref = useAppSelector((state: any) => state.chat.newChatModel);

  // 1. Initialize
  useEffect(() => {
    if (!sessionId || !token) {
      if (!sessionId) setMessages([]);
      return;
    }

    const initChat = async () => {
      setIsLoading(true);
      try {
        // A. Load Messages
        const history = await SessionService.getSessionMessages(
          token,
          sessionId
        );
        setMessages(history);

        // B. Lock Model (CRITICAL FIX)
        const details = await SessionService.getSession(token, sessionId);
        if (details) {
          dispatch(
            setActiveSessionConfig({
              modelId: details.model,
              provider: details.provider,
            })
          );
        }

        // C. Connect Socket
        socketService.connect(token, sessionId);
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
    return () => socketService.disconnect();
  }, [sessionId, token, dispatch]);

  // 2. Stream Handling
  useEffect(() => {
    socketService.onMessage((data) => {
      if (data.type === "stream") {
        setIsThinking(false); // Stop thinking once stream starts
        setIsStreaming(true);

        if (data.done) {
          setIsStreaming(false);
          triggerChatUpdate();
          return;
        }

        const chunk = data.content || data.chunk || data.text || "";
        if (!chunk) return;

        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, content: lastMsg.content + chunk },
            ];
          } else {
            return [...prev, { role: "assistant", content: chunk }];
          }
        });
      }
    });
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;

      setMessages((prev) => [...prev, { role: "user", content }]);
      setIsThinking(true); // Show "Thinking..."

      // Use Active Config (if chat exists) OR New Preference (if new)
      const model =
        sessionId && activeConfig ? activeConfig.modelId : newChatPref.id;
      const provider =
        sessionId && activeConfig
          ? activeConfig.provider
          : newChatPref.provider;

      console.log(`Sending to ${provider}/${model}`);
      if (sessionId) {
        socketService.sendMessage(content, model, provider);
      }
    },
    [sessionId, activeConfig, newChatPref]
  );

  const deleteMessage = async (messageId: string) => {
    if (!token) return;
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    await SessionService.deleteMessage(token, messageId);
  };

  return {
    messages,
    sendMessage,
    deleteMessage,
    isLoading,
    isStreaming,
    isThinking,
  };
};
