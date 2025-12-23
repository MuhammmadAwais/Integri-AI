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
    async (text: string, file?: File | null) => {
      // 1. Strict Guard: No empty sends (unless file exists)
      if ((!text || !text.trim()) && !file) return;

      // 2. Create Attachment Object for Optimistic Preview
      const attachment = file
        ? {
            name: file.name,
            type: file.type.startsWith("image/")
              ? ("image" as const)
              : ("file" as const),
            url: URL.createObjectURL(file), // Creates a local preview URL
          }
        : undefined;

      // 3. Optimistic Update (Immediate Preview)
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text, attachment },
      ]);

      let currentSessionId = sessionId;
      let currentSocket = socketRef.current;

      // 4. Lazy Create Session if needed
      if (!currentSessionId) {
        if (!token) return;

        try {
          setIsLoading(true);
          const res = await SessionService.createSession(
            token,
            modelConfig.id,
            modelConfig.provider
          );

          if (res?.session_id) {
            currentSessionId = res.session_id;
            setSessionId(currentSessionId);

            // Set Title & Notify Sidebar
            const title =
              (text ? text.slice(0, 20) : "Attachment") + "... [PL]";
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

      // 5. Handle File Upload & Send
      if (currentSocket) {
        try {
          let fileIds: string[] = [];

          // Upload if file exists
          if (file && token) {
            console.log("Playground: Uploading file...", file.name);
            try {
              const uploadedId = await SessionService.uploadFile(token, file);
              if (uploadedId) {
                fileIds.push(uploadedId);
                console.log("Playground: File uploaded, ID:", uploadedId);
              }
            } catch (err) {
              console.error("Playground: File upload failed", err);
              // We continue sending text even if upload fails, or you could return here
            }
          }

          // Delay slightly if socket was just created to ensure connection is open
          setTimeout(
            () => {
              currentSocket?.sendMessage(
                text,
                modelConfig.id,
                modelConfig.provider,
                fileIds // Pass the file IDs here
              );
            },
            currentSessionId === sessionId ? 0 : 1000
          );
        } catch (err) {
          console.error("Message sending failed", err);
        }
      }
    },
    [sessionId, token, modelConfig]
  );

  return { messages, sendMessage, isStreaming, isLoading, sessionId };
};
