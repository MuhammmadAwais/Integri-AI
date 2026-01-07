import { useState, useEffect, useCallback, useRef } from "react";
import { socketService } from "../../../services/WebSocketsService";
import { SessionService } from "../../../api/backendApi";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import {
  setActiveSessionConfig,
  setSessions,
  addSession,
  removeSession,
  updateSessionTitle, // Import the reducer
} from "../../chat/chatSlice";

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  attachment?: {
    name: string;
    type: "image" | "file";
    url: string;
  };
  isGeneratingImage?: boolean;
}

// --- UPGRADED: Event Trigger with Payload ---
export const triggerChatUpdate = (newSession?: any) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("chat-updated", {
      detail: newSession,
    });
    window.dispatchEvent(event);
  }
};

// --- HOOK 1: Sidebar List (Redux Integrated) ---
export const useChatList = () => {
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state: any) => state.chat.sessions);
  const token = useAppSelector((state: any) => state.auth.accessToken);
  const [loading, setLoading] = useState(true);

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
      dispatch(setSessions(sorted));
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoading(false);
    }
  }, [token, dispatch]);

  useEffect(() => {
    fetchChats();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        dispatch(addSession(customEvent.detail));
      } else {
        fetchChats();
      }
    };

    window.addEventListener("chat-updated", handleUpdate);
    return () => window.removeEventListener("chat-updated", handleUpdate);
  }, [fetchChats, dispatch]);

  const handleDeleteChat = async (sessionId: string) => {
    if (!token) return;
    dispatch(removeSession(sessionId));
    try {
      await SessionService.deleteSession(token, sessionId);
    } catch (error) {
      console.error("Failed to delete", error);
      fetchChats();
    }
  };

  return { chats, loading, refreshChats: fetchChats, handleDeleteChat };
};

// --- HOOK 2: Single Chat (Updated with Title Sync) ---

export const useChat = (sessionId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Ref to track if we need to fetch title (prevents duplicate fetches)
  const hasFetchedTitleRef = useRef(false);

  const dispatch = useAppDispatch();
  const token = useAppSelector((state: any) => state.auth.accessToken);

  // Get sessions from Redux to check current title state
  const sessions = useAppSelector((state: any) => state.chat.sessions);

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
      setMessagesLoaded(false);
      hasFetchedTitleRef.current = false; // Reset for new session

      try {
        const history = await SessionService.getSessionMessages(
          token,
          sessionId
        );
        if (Array.isArray(history)) {
          const mappedMessages = history.map((msg: any) => ({
            ...msg,
            attachment: msg.image_url
              ? { name: "Generated Image", type: "image", url: msg.image_url }
              : undefined,
          }));
          setMessages(mappedMessages);
        } else {
          setMessages([]);
        }

        setMessagesLoaded(true);

        const details = await SessionService.getSession(token, sessionId);
        if (details) {
          console.log(details , "hi how are you jsut console logging")
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

  // 2. Intelligent Re-fetch Logic (Fallback)
  // Watch for the end of the first assistant response
  useEffect(() => {
    if (!sessionId || !token || isStreaming || isThinking) return;

    // Condition: We have a small number of messages (implying start of chat)
    // and the title hasn't been fetched via fallback yet.
    if (
      messages.length > 0 &&
      messages.length <= 4 &&
      !hasFetchedTitleRef.current
    ) {
      const currentSession = sessions.find(
        (s: any) => (s.id || s.session_id) === sessionId
      );
      const isDefaultTitle =
        !currentSession ||
        currentSession.title === "New Chat" ||
        currentSession.title === "New Conversation";

      if (isDefaultTitle) {
        hasFetchedTitleRef.current = true;

        // Wait a brief moment for backend NLP to finalize title
        const timer = setTimeout(async () => {
          try {
            // Silent fetch - doesn't trigger global loading
            const sessionData = await SessionService.getSession(
              token,
              sessionId
            );
            if (
              sessionData &&
              sessionData.title &&
              sessionData.title !== "New Chat"
            ) {
              // Update Redux -> Sidebar updates automatically
              dispatch(
                updateSessionTitle({
                  id: sessionId,
                  title: sessionData.title,
                })
              );
            } else {
              // If still default, reset ref to try again next message
              hasFetchedTitleRef.current = false;
            }
          } catch (e) {
            console.error("Silent title refresh failed", e);
            hasFetchedTitleRef.current = false;
          }
        }, 3000); // 3 second delay

        return () => clearTimeout(timer);
      }
    }
  }, [messages, isStreaming, isThinking, sessionId, token, sessions, dispatch]);

  // 3. Stream & Event Handling
  useEffect(() => {
    socketService.onMessage((data) => {
      // --- NEW: Handle Event-Driven Title Updates ---
      if (data.type === "title_generated" || data.type === "session_updated") {
        const newTitle = data.title || data.session?.title;
        if (newTitle && sessionId) {
          dispatch(updateSessionTitle({ id: sessionId, title: newTitle }));
          hasFetchedTitleRef.current = true; // Mark as done so fallback doesn't run
        }
        return;
      }

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

      // B. Image Generation Status
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

      // C. Image Generated
      if (data.type === "image_generated") {
        setIsThinking(false);
        setIsStreaming(false);

        const imageUrl = data.image_url || "";
        const caption = data.content || data.revised_prompt || "";

        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
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
  }, [dispatch, sessionId]); // Added dispatch and sessionId dependencies

  // 4. Send Message
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

        if (file && token) {
          try {
            const uploadedId = await SessionService.uploadFile(token, file);
            if (uploadedId) fileIds.push(uploadedId);
          } catch (uploadError) {
            console.error("File upload failed:", uploadError);
            setIsThinking(false);
            return;
          }
        }

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
    messagesLoaded,
  };
};
