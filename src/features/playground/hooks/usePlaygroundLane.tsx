import { useState, useRef, useEffect, useCallback } from "react";
import { WebSocketService } from "../../../services/WebSocketsService";
import { SessionService } from "../../../api/backendApi";
import { useAppSelector } from "../../../hooks/useRedux";

// Event Helper to update Sidebar
const triggerGlobalUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("chat-updated"));
  }
};

export const usePlaygroundLane = (modelConfig: {
  id: string;
  provider: string;
}) => {
  // 1. Setup State
  const token = useAppSelector((state: any) => state.auth.accessToken);
  const socketRef = useRef<WebSocketService | null>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Cleanup on Unmount
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // 3. Send Message Handler (Lazy Creation Logic)
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // A. Optimistic Update (Show user message immediately)
      setMessages((prev) => [...prev, { role: "user", content: text }]);

      let currentSessionId = sessionId;
      let currentSocket = socketRef.current;

      // B. If NO Session, Create it NOW (Lazy Load)
      if (!currentSessionId) {
        if (!token) return;

        try {
          setIsLoading(true);

          // 1. Create Session via API
          const res = await SessionService.createSession(
            token,
            modelConfig.id,
            modelConfig.provider
          );

          if (res?.session_id) {
            currentSessionId = res.session_id;
            setSessionId(currentSessionId);

            // 2. Generate Title: "Prompt... [PL]"
            const shortTitle =
              text.slice(0, 20) + (text.length > 20 ? "..." : "");
            const title = `${shortTitle} [PL]`;

            await SessionService.updateSession(token, currentSessionId as any, title);

            // 3. Refresh Sidebar
            triggerGlobalUpdate();

            // 4. Initialize WebSocket for this new session
            const ws = new WebSocketService();
            ws.connect(token, currentSessionId as any);

            ws.onMessage((data) => {
              if (data.type === "stream") {
                const done = data.done;
                const chunk = data.content || data.chunk || "";

                setIsStreaming(!done);

                if (chunk) {
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
              }
            });

            socketRef.current = ws;
            currentSocket = ws;
          }
        } catch (e) {
          console.error("Failed to lazy init session", e);
        } finally {
          setIsLoading(false);
        }
      }

      // C. Send Message via Socket (Wait briefly if socket is just connecting)
      if (currentSocket) {
        // Small delay to ensure socket is open if just created
        setTimeout(
          () => {
            currentSocket?.sendMessage(
              text,
              modelConfig.id,
              modelConfig.provider
            );
          },
          currentSessionId === sessionId ? 0 : 500
        );
      }
    },
    [sessionId, token, modelConfig.id, modelConfig.provider]
  );

  return { messages, sendMessage, isStreaming, isLoading, sessionId };
};
