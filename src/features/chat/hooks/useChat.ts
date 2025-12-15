import { useState, useEffect, useCallback } from "react";
import { socketService } from "../../../services/WebSocketsService";
import { SessionService } from "../../../api/backendApi";
import { useAppSelector } from "../../../hooks/useRedux";

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
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

  const token = useAppSelector((state: any) => state.auth.accessToken);
  const currentModel = useAppSelector((state: any) => state.chat.currentModel);

  // 1. Initialize
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

  // 2. Listen for Messages (ROBUST FIX)
  useEffect(() => {
    socketService.onMessage((data) => {
      if (data.type === "stream") {
        setIsStreaming(true);

        if (data.done) {
          setIsStreaming(false);
          return;
        }

        // 🛡️ FIX: Check ALL possible names for the text
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

  return { messages, sendMessage, isLoading, isStreaming };
};
