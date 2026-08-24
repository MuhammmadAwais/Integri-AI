import { useState, useEffect, useCallback, useRef } from "react";
import { extractMaxSizeFromError } from "../components/FileSizeLimitToast";
import { socketService } from "../../../services/WebSocketsService";
import { SessionService } from "../../../api/backendApi";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import { uploadFilesSequentially } from "../../../utils/uploadFilesPipeline";
import {
  setActiveSessionConfig,
  setSessions,
  addSession,
  removeSession,
  updateSessionTitle, 
} from "../../chat/chatSlice";
import AVAILABLE_MODELS from "../../../../Constants";

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  attachment?: {
    name: string;
    type: "image" | "file";
    url: string;
  };
  attachments?: {
    name: string;
    type: "image" | "file";
    url: string;
  }[];
  file_ids?: string[];
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

export const useChat = (sessionId: string | undefined, initialMessage?: string, initialFiles?: File[]) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileUploadStage, setFileUploadStage] = useState<
    "idle" | "uploading" | "processing" | "error"
  >("idle");

  // File size limit error state — set when backend returns 413
  const [fileSizeLimitError, setFileSizeLimitError] = useState<{
    message: string;
    maxSize?: string;
  } | null>(null);

  // Ref to track if we need to fetch title (prevents duplicate fetches)
  const hasFetchedTitleRef = useRef(false);
  // Ref to track if initial message has been added optimistically for current session
  const hasAddedInitialMessageRef = useRef<string | null>(null);
  // Ref to store initial message and file for current session
  const initialMessageRef = useRef<{ message?: string; files?: File[] }>({});

  const dispatch = useAppDispatch();
  const token = useAppSelector((state: any) => state.auth.accessToken);

  // Get sessions from Redux to check current title state
  const sessions = useAppSelector((state: any) => state.chat.sessions);

  const activeConfig = useAppSelector(
    (state: any) => state.chat.activeSessionConfig
  );
  const newChatPref = useAppSelector((state: any) => state.chat.newChatModel);

  // Store initial message when it changes
  useEffect(() => {
    if (initialMessage || initialFiles) {
      initialMessageRef.current = { message: initialMessage, files: initialFiles };
    }
  }, [initialMessage, initialFiles]);

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
      
      // Reset initial message ref if this is a new session
      if (hasAddedInitialMessageRef.current !== sessionId) {
        hasAddedInitialMessageRef.current = null;
      }

      // Add initial message optimistically BEFORE fetching history
      // This ensures it's visible immediately and won't be cleared by empty history
      const { message, files } = initialMessageRef.current;
      if (message && hasAddedInitialMessageRef.current !== sessionId) {
        hasAddedInitialMessageRef.current = sessionId;
        const attachments = files?.map(file => ({
          name: file.name,
          type: file.type.startsWith("image/")
            ? ("image" as const)
            : ("file" as const),
          url: URL.createObjectURL(file),
        }));
        
        setMessages([
          { role: "user", content: message, attachments, attachment: attachments?.[0] },
        ]);
      }

      try {
        const history = await SessionService.getSessionMessages(
          token,
          sessionId
        );
        if (Array.isArray(history) && history.length > 0) {
          const mappedMessages = history.map((msg: any) => ({
            ...msg,
            file_ids: msg.file_ids || msg.files || [],
            attachment: msg.image_url
              ? { name: "Generated Image", type: "image", url: msg.image_url }
              : undefined,
          }));
          
          // Replace with fetched history, ensuring we preserve optimistic attachments
          setMessages((prev) => {
            const merged = mappedMessages.map((msg: any) => {
              // Match by role and content length to retrieve optimistic local attachment arrays
              // The backend doesn't store our local blob URLs, so this is critical
              const existing = prev.find(p => p.role === msg.role && p.content === msg.content && p.attachments?.length);
              if (existing && existing.attachments) {
                return { ...msg, attachments: existing.attachments, attachment: existing.attachment };
              }
              return msg;
            });
            return merged;
          });
        } else if (!message) {
          // Only clear if we don't have an initial message to show
          setMessages([]);
        }
        // If history is empty but we have initialMessage, keep the optimistic message

        setMessagesLoaded(true);

        try {
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
        } catch (detailsError) {
          console.error("Error fetching session details:", detailsError);
          // Don't throw - continue with initialization
        }

        try {
          socketService.connect(token, sessionId);
        } catch (socketError) {
          console.error("Error connecting socket:", socketError);
          // Don't throw - messages can still be displayed
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        // Ensure messagesLoaded is set even on error so UI doesn't hang
        setMessagesLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
    return () => socketService.disconnect();
  }, [sessionId, token, dispatch]); // Removed initialMessage and initialFile from deps to prevent re-initialization loops

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
            // Normal case: append chunk to existing assistant message
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, content: lastMsg.content + chunk },
            ];
          } else if (lastMsg?.role === "assistant" && lastMsg.isGeneratingImage) {
            // A "status" placeholder was set but a text stream arrived — it's NOT
            // an image generation; replace the skeleton with the real streamed text.
            return [
              ...prev.slice(0, -1),
              { role: "assistant", content: chunk, isGeneratingImage: false },
            ];
          } else {
            return [...prev, { role: "assistant", content: chunk }];
          }
        });
      }

      // B. Image Generation Status
      // Only show the generating-image skeleton when the backend explicitly signals
      // image generation. Generic "status" events (e.g. web search progress) must
      // NOT trigger this path — they just keep the thinking indicator alive.
      if (data.type === "status") {
        const isImageStatus =
          data.status === "generating_image" ||
          data.generating_image === true ||
          data.image_generation === true;

        if (isImageStatus) {
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
        // For non-image status events (web search, etc.) do nothing extra —
        // the thinking spinner already visible is sufficient feedback.
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

  // 4. Send Message — S3 4-Step Pipeline
  const sendMessage = useCallback(
    async (content: string, files?: File[], modelOverride?: string, webSearch?: boolean) => {
      const validFiles = files?.filter((f) => f != null) || [];
      if (!content.trim() && validFiles.length === 0) return;

      const attachments = validFiles.map((file) => ({
        name: file.name,
        type: file.type?.startsWith("image/")
          ? ("image" as const)
          : ("file" as const),
        url: URL.createObjectURL(file),
      }));

      // Check if message already exists (from optimistic add)
      setMessages((prev) => {
        const messageExists = prev.some(
          (msg) =>
            msg.role === "user" &&
            msg.content === content &&
            (validFiles.length === 0 || msg.attachments?.length === validFiles.length)
        );
        if (messageExists) return prev;
        return [...prev, { role: "user", content: content, attachments, attachment: attachments?.[0] }];
      });
      setIsThinking(true);

      try {
        // Use model override if provided (for search modes), otherwise use session config or default
        const model =
          modelOverride ||
          (sessionId && activeConfig ? activeConfig.modelId : newChatPref.id);

        // Find provider for the model
        const modelData = AVAILABLE_MODELS.find((m) => m.id === model);
        const provider =
          modelData?.provider ||
          (sessionId && activeConfig
            ? activeConfig.provider
            : newChatPref.provider);

        let fileIds: string[] = [];

        // --- S3 File Upload Pipeline (shared utility) ---
        if (validFiles.length > 0 && token && sessionId) {
          setIsUploading(true);
          setFileUploadStage("uploading");
          try {
            fileIds = await uploadFilesSequentially(token, validFiles, sessionId);
            
            // Add fileIds to the optimistic user message to prevent streaming overwrite
            setMessages((prev) => prev.map((msg, idx) => 
               idx === prev.length - 1 && msg.role === "user" 
                 ? { ...msg, file_ids: fileIds }
                 : msg
            ));
            
            setFileUploadStage("idle");
          } catch (uploadError: any) {
            console.error("❌ [useChat] File pipeline failed:", uploadError);
            setFileUploadStage("error");
            setTimeout(() => setFileUploadStage("idle"), 3000);
            setIsThinking(false);
            setIsUploading(false);

            // ── Detect backend 413 file-size limit errors ──────────────────
            const status = uploadError?.response?.status;
            const detail =
              uploadError?.response?.data?.detail ||
              uploadError?.response?.data?.message ||
              uploadError?.message ||
              "";
            const isFileSizeError =
              status === 413 ||
              /file size|too large|exceeds.*limit|limit.*exceeded/i.test(detail);

            if (isFileSizeError) {
              const backendMsg = detail || "File size exceeds the limit for your plan.";
              setFileSizeLimitError({
                message: backendMsg,
                maxSize: extractMaxSizeFromError(backendMsg),
              });
            }

            return;
          } finally {
            setIsUploading(false);
          }
        }

        if (sessionId) {
          socketService.sendMessage(content, model, provider, fileIds, undefined, undefined, webSearch);
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
    isUploading,
    messagesLoaded,
    fileUploadStage,
    fileSizeLimitError,
    clearFileSizeLimitError: () => setFileSizeLimitError(null),
  };
};
