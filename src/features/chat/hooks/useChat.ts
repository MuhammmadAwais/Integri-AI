import { useState, useEffect, useCallback } from "react";
import { socketService } from "../../../services/WebSocketsService";
import { SessionService } from "../../../api/backendApi";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import { setActiveSessionConfig } from "../../chat/chatSlice";

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  attachment?: {
    name: string;
    type: "image" | "file";
    url: string;
  };
  // NEW: Track if this message is a placeholder for generating an image
  isGeneratingImage?: boolean;
}

export const triggerChatUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("chat-updated"));
  }
};

// --- HOOK 1: Sidebar List ---
export const useChatList = (userId?: string) => {
  // Suppress unused variable warning if intended
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
  const [messagesLoaded, setMessagesLoaded] = useState(false); // <--- NEW FLAG
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
      setMessagesLoaded(false); // Reset on ID change
      try {
        // Fetch History
        const history = await SessionService.getSessionMessages(
          token,
          sessionId
        );
        if (Array.isArray(history)) {
          // Map history to include image attachments if present
          const mappedMessages = history.map((msg: any) => ({
            ...msg,
            attachment: msg.image_url
              ? {
                  name: "Generated Image",
                  type: "image",
                  url: msg.image_url,
                }
              : undefined,
          }));
          setMessages(mappedMessages);
        } else {
          setMessages([]);
        }

        // Mark history as loaded
        setMessagesLoaded(true); // <--- READY TO ACCEPT NEW MESSAGES

        // Fetch Session Config
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
      // A. Text Stream
      if (data.type === "stream") {
        setIsThinking(false);
        setIsStreaming(true);

        if (data.done) {
          setIsStreaming(false);
          return;
        }

        const chunk = data.content || data.chunk || data.text || "";
        if (!chunk) return;

        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          // Append to last message if it's assistant and NOT an image placeholder
          if (
            lastMsg &&
            lastMsg.role === "assistant" &&
            !lastMsg.isGeneratingImage &&
            !lastMsg.attachment
          ) {
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, content: lastMsg.content + chunk },
            ];
          } else {
            return [...prev, { role: "assistant", content: chunk }];
          }
        });
      }

      // B. Image Generation Status (Thinking state for images)
      if (data.type === "status") {
        setIsThinking(false);
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg?.role === "assistant" && lastMsg.isGeneratingImage)
            return prev;

          return [
            ...prev,
            { role: "assistant", content: "", isGeneratingImage: true },
          ];
        });
      }

      // C. Image Generated (Final result)
      if (data.type === "image_generated") {
        setIsThinking(false);
        setIsStreaming(false);

        const imageUrl = data.url;
        const caption = data.content || "";

        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];

          // Replace the "Generating..." placeholder
          if (lastMsg?.role === "assistant" && lastMsg.isGeneratingImage) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMsg,
                isGeneratingImage: false,
                content: caption,
                attachment: {
                  name: "Generated Image",
                  type: "image",
                  url: imageUrl,
                },
              },
            ];
          }

          // Fallback: append new message
          return [
            ...prev,
            {
              role: "assistant",
              content: caption,
              attachment: {
                name: "Generated Image",
                type: "image",
                url: imageUrl,
              },
            },
          ];
        });
        triggerChatUpdate();
      }
    });
  }, []);

  // 3. Send Message
  const sendMessage = useCallback(
    async (content: string, file?: File | null) => {
      if (!content.trim() && !file) return;

      const attachment = file
        ? {
            name: file.name,
            type: file.type.startsWith("image/")
              ? ("image" as const)
              : ("file" as const),
            url: URL.createObjectURL(file),
          }
        : undefined;

      setMessages((prev) => [
        ...prev,
        { role: "user", content: content, attachment },
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

        // --- UPLOAD LOGIC ---
        if (file && token) {
          try {
            console.log("Uploading file...");
            // Step 1: Upload and wait for response
            const uploadedId = await SessionService.uploadFile(token, file);

            // Step 2: Validate ID (matches Dart: where(id => id.isNotEmpty))
            if (uploadedId) {
              fileIds.push(uploadedId);
              console.log("File uploaded, ID:", uploadedId);
            }
          } catch (uploadError) {
            console.error("File upload failed:", uploadError);
            // Matches Dart logic: if (fileIds.isEmpty) throw Exception...
            // We stop the process here so we don't send a message without the required context
            setIsThinking(false);
            // Optional: You could add a toast notification here
            return;
          }
        }

        // --- SEND LOGIC ---
        // Step 3: Send message ONLY after upload is processed
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
    if (!token || !sessionId) return;
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await SessionService.deleteMessage(token, sessionId, messageId);
    } catch (error) {
      console.error("Failed to delete message", error);
    }
  };

  return {
    messages,
    sendMessage,
    deleteMessage,
    isLoading,
    isStreaming,
    isThinking,
    messagesLoaded, // <--- Return this
  };
};
