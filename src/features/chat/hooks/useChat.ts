import { useState, useEffect, useCallback } from "react";
// Make sure this path matches where you saved WebSocketService.ts
import { socketService } from "../../../services/WebSocketsService";
import { SessionService } from "../../../api/backendApi";
import { useAppSelector } from "../../../hooks/useRedux";

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

// Hook to fetch the list of chats (Sidebar)
export const useChatList = (userId: string | undefined) => {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useAppSelector((state: any) => state.auth.token);

  useEffect(() => {
    const fetchChats = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await SessionService.getSessions(token);
        const sessionList = Array.isArray(data) ? data : data.items || [];
        setChats(sessionList);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [userId, token]);

  return { chats, loading };
};

// Hook to handle the Active Chat (Messages + WebSocket)
export const useChat = (sessionId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const token = useAppSelector((state: any) => state.auth.token);
  const currentModel = useAppSelector((state: any) => state.chat.currentModel);

  // 1. Initialize: Load History & Connect Socket
  useEffect(() => {
    if (!sessionId || !token) return;

    const initChat = async () => {
      setIsLoading(true);
      try {
        // A. Load History via REST API
        const history = await SessionService.getSessionMessages(
          token,
          sessionId
        );
        setMessages(history);

        // B. Connect WebSocket
        socketService.connect(token, sessionId);
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();

    // Cleanup: Disconnect when leaving the page
    return () => {
      socketService.disconnect();
    };
  }, [sessionId, token]);

  // 2. Listen for Incoming Stream
  useEffect(() => {
    socketService.onMessage((data) => {
      if (data.type === "stream") {
        setIsStreaming(true);

        if (data.done) {
          setIsStreaming(false);
          return;
        }

        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          // Append to existing assistant message
          if (lastMsg && lastMsg.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, content: lastMsg.content + data.content },
            ];
          }
          // Start new assistant message
          else {
            return [...prev, { role: "assistant", content: data.content }];
          }
        });
      }
    });
  }, []);

  // 3. Send Message
  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;

      // Optimistic Update (Show user message immediately)
      setMessages((prev) => [...prev, { role: "user", content }]);

      // Send via WebSocket
      socketService.sendMessage(content, currentModel || "gpt-4o");
    },
    [currentModel]
  );

  return {
    messages,
    sendMessage,
    isLoading,
    isStreaming,
  };
};
