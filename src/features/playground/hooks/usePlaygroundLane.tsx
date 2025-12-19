import { useState, useRef, useEffect, useCallback } from "react";
import { WebSocketService } from "../../../services/WebSocketsService";
import { SessionService } from "../../../api/backendApi";
import { useAppSelector } from "../../../hooks/useRedux";

const triggerGlobalUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("chat-updated"));
  }
};

export const usePlaygroundLane = (modelConfig: {
  id: string;
  provider: string;
}) => {
  const token = useAppSelector((state: any) => state.auth.accessToken);
  const socketRef = useRef<WebSocketService | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => socketRef.current?.disconnect();
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      // 1. Strict Guard: No empty sends
      if (!text || !text.trim()) return;

      // 2. Optimistic Update
      setMessages((prev) => [...prev, { role: "user", content: text }]);

      let currentSessionId = sessionId;
      let currentSocket = socketRef.current;

      // 3. Lazy Create Session
      if (!currentSessionId) {
        if (!token) return;

        try {
          setIsLoading(true);
          const res = await SessionService.createSession(
            token,
            modelConfig.id,
            modelConfig.provider // Pass correct provider
          );

          if (res?.session_id) {
            currentSessionId = res.session_id;
            setSessionId(currentSessionId);

            // Set Title & Notify Sidebar
            const title = text.slice(0, 20) + "... [PL]";
            await SessionService.updateSession(
              token,
              currentSessionId as any,
              title
            );
            triggerGlobalUpdate();

            // Connect Socket
            const ws = new WebSocketService();
            ws.connect(token, currentSessionId as any);

            ws.onMessage((data) => {
              if (data.type === "stream") {
                setIsStreaming(!data.done);
                const chunk = data.content || data.chunk || "";
                if (chunk) {
                  setMessages((prev) => {
                    const last = prev[prev.length - 1];
                    if (last?.role === "assistant") {
                      return [
                        ...prev.slice(0, -1),
                        { ...last, content: last.content + chunk },
                      ];
                    }
                    return [...prev, { role: "assistant", content: chunk }];
                  });
                }
              }
            });

            socketRef.current = ws;
            currentSocket = ws;
          }
        } catch (e) {
          console.error("Playground session failed", e);
        } finally {
          setIsLoading(false);
        }
      }

      // 4. Send Message via Socket
      if (currentSocket) {
        setTimeout(
          () => {
            currentSocket?.sendMessage(
              text,
              modelConfig.id,
              modelConfig.provider
            );
          },
          currentSessionId === sessionId ? 0 : 500
        ); // Delay if fresh socket
      }
    },
    [sessionId, token, modelConfig]
  );

  return { messages, sendMessage, isStreaming, isLoading, sessionId };
};
