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

  useEffect(() => {
    fetchChats();
    const handleUpdate = () => setTimeout(fetchChats, 300);
    window.addEventListener("chat-updated", handleUpdate);
    return () => window.removeEventListener("chat-updated", handleUpdate);
  }, [fetchChats]);

  const handleDeleteChat = async (sessionId: string) => {
    if (!token) return;
    const prevChats = [...chats];
    setChats((prev) =>
      prev.filter((c) => (c.session_id || c.id) !== sessionId)
    );
    try {
      await SessionService.deleteSession(token, sessionId);
      triggerChatUpdate();
    } catch (error) {
      console.error("Failed to delete", error);
      setChats(prevChats);
    }
  };

  return { chats, loading, refreshChats: fetchChats, handleDeleteChat };
};

// --- HOOK 2: Single Chat ---
export const useChat = (sessionId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const dispatch = useAppDispatch();
  const token = useAppSelector((state: any) => state.auth.accessToken);

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
        const history = await SessionService.getSessionMessages(
          token,
          sessionId
        );
        if (Array.isArray(history)) {
          setMessages(history);
        } else {
          setMessages([]);
        }

        const details = await SessionService.getSession(token, sessionId);
        if (details) {
          dispatch(
            setActiveSessionConfig({
              modelId: details.model,
              provider: details.provider,
            })
          );
        }

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
        setIsThinking(false);
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

  // 3. Send Message (Updated for File Upload)
  const sendMessage = useCallback(
    async (content: string, file?: File | null) => {
      if (!content.trim() && !file) return;

      // Optimistic Update
      const displayContent = file
        ? `[Uploaded File: ${file.name}] ${content}`
        : content;

      setMessages((prev) => [
        ...prev,
        { role: "user", content: displayContent },
      ]);
      setIsThinking(true);

      try {
        const model =
          sessionId && activeConfig ? activeConfig.modelId : newChatPref.id;
        const provider =
          sessionId && activeConfig
            ? activeConfig.provider
            : newChatPref.provider;

        let fileIds: string[] = [];

        // --- UPLOAD LOGIC START ---
        if (file && token) {
          try {
            console.log("Uploading file...");
            // Upload first, get ID
            const uploadedId = await SessionService.uploadFile(token, file);
            if (uploadedId) {
              fileIds.push(uploadedId);
              console.log("File uploaded, ID:", uploadedId);
            }
          } catch (uploadError) {
            console.error("File upload failed:", uploadError);
            // Decide if you want to abort message sending here or continue with just text
            // Continuing for now, but you could add UI error handling
          }
        }
        // --- UPLOAD LOGIC END ---

        console.log(`Sending to ${provider}/${model} with fileIds:`, fileIds);
        if (sessionId) {
          socketService.sendMessage(content, model, provider, fileIds);
        }
      } catch (err) {
        console.error("Send message flow failed", err);
        setIsThinking(false);
      }
    },
    [sessionId, activeConfig, newChatPref, token]
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
