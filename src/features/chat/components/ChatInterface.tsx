import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ChatInput from "./ChatInput";
import MessageBubble from "../../../Components/ui/MessageBubble";
import ThinkingSkeleton from "../../../Components/ui/ThinkingSkeleton";
import { useAppSelector, useAppDispatch } from "../../../hooks/useRedux";
import { useChat } from "../hooks/useChat";
import { cn } from "../../../lib/utils";
import { ChatService } from "../services/chatService";
import { SessionService } from "../../../api/backendApi";
import AdSense from "../../../Components/ui/AdSense";
import { useSubscription } from "../../subscriptions/hooks/useSubscription";
import { useLimits } from "../../limits/hooks/useLimits";
import { decrementMessages } from "../../limits/slices/limitsSlice";
import { showLimitReachedToast } from "../../limits/components/LimitToast";
import { toast } from "react-toastify";
import SkeletonLoader from "../../../Components/ui/SkeletonLoader";

interface ChatInterfaceProps {
  features?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ features = true }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const token = useAppSelector((state: any) => state.auth.accessToken);
  const newChatModel = useAppSelector((state: any) => state.chat.newChatModel);
  const selectedAgentId = useAppSelector(
    (state: any) => state.chat.selectedAgentId
  );
  const { isFree } = useSubscription();
  const { hasRemainingMessages, limits, resetTimeFormatted } = useLimits();
  const dispatch = useAppDispatch();
  const limitReached = !hasRemainingMessages;

  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const {
    messages,
    sendMessage,
    deleteMessage,
    isLoading,
    isStreaming,
    isThinking,
    messagesLoaded,
    fileUploadStage,
  } = useChat(id, location.state?.initialMessage, location.state?.initialFiles || (location.state?.initialFile ? [location.state?.initialFile] : undefined));

  const hasAutoSent = useRef(false);

  // 1. Handle Auto-Send (Conversation Starter)
  // We wait for 'messagesLoaded' to ensure we don't overwrite the message
  // with an empty history array from the initial fetch.
  useEffect(() => {
    if (
      id &&
      messagesLoaded &&
      location.state?.initialMessage &&
      !hasAutoSent.current
    ) {
      hasAutoSent.current = true;
      const { initialMessage, initialFiles, initialFile } = location.state;
      const filesToPass = initialFiles || (initialFile ? [initialFile] : undefined);

      // Always call sendMessage - it will check if message exists and avoid duplicates
      // but will still send via socket if needed.
      // If there's files, the `useChat`'s `sendMessage` handles the
      // Promise-Gate `uploadFilesSequentially` blocking transparently before
      // the websocket message fires.
      sendMessage(initialMessage, filesToPass);

      // Clear state to prevent re-sending on refresh
      window.history.replaceState({}, document.title);
    }
  }, [id, messagesLoaded, location.state, sendMessage]);

  // 2. SCROLL LOGIC
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user" && !isStreaming) {
      scrollToBottom();
    }
  }, [messages.length, isStreaming]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // 3. MAIN SEND HANDLER
  const handleSend = async (text: string, files?: File[], searchMode?: "search" | "deep-search" | null) => {
    const file = files && files.length > 0 ? files[0] : null;
    if (!text.trim() && !file) return;

    // ── Limit check BEFORE send ───────────────────────────────────────────────
    if (limitReached) {
      showLimitReachedToast({
        feature: "messages",
        limit: limits?.daily_message_limit ?? 0,
        resetTime: resetTimeFormatted,
      });
      return;
    }

    // Optimistic decrement so the UI reacts immediately
    dispatch(decrementMessages());

    // Override model if search mode is active
    let modelId = newChatModel.id;
    if (searchMode === "search") {
      modelId = "gpt-4o-mini-search-preview";
    } else if (searchMode === "deep-search") {
      modelId = "gpt-4o-mini-deep-research";
    }

    if (id) {
      sendMessage(text, files || (file ? [file] : []), modelId);
      setTimeout(scrollToBottom, 100);
      return;
    }

    // New Chat Flow
    if (!token) return;
    try {
      setIsCreatingSession(true);
      const newSessionId = await ChatService.createChat(
        token,
        modelId,
        selectedAgentId || undefined
      );

      const cleanText = text.trim();
      const title = cleanText ? cleanText.substring(0, 30) : "New Chat";
      SessionService.updateSession(token, newSessionId, title);

      navigate(`/chat/${newSessionId}`, {
        state: {
          initialMessage: text,
          initialFiles: files || (file ? [file] : undefined),
          model: modelId,
        },
      });
    } catch (error) {
      console.error("Failed to create session:", error);
      toast.error("Failed to create new chat session.");
      setIsCreatingSession(false);
    }
  };

  // ── Check limit AFTER AI reply ─────────────────────────────────────────────
  const prevStreaming = useRef(false);
  useEffect(() => {
    const wasStreaming = prevStreaming.current;
    prevStreaming.current = isStreaming;
    // Transition: was streaming → stopped
    if (wasStreaming && !isStreaming && limitReached) {
      showLimitReachedToast({
        feature: "messages",
        limit: limits?.daily_message_limit ?? 0,
        resetTime: resetTimeFormatted,
      });
    }
  }, [isStreaming, limitReached, limits, resetTimeFormatted]);

  console.log(messages)
  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden relative">
      {/* LEFT AD - Positioned absolutely to not disturb layout - Shows for unauthenticated users and free tier users */}
      {/* Account for sidebar width (240px) + margin */}
      {isFree && (
        <div className="hidden lg:block fixed left-[256px] top-1/2 -translate-y-1/2 w-[160px] xl:w-[200px] z-[5]">
          <AdSense
            key="ad-left-chat-9138262333"
            adSlot="9138262333"
            adClient="ca-pub-2692304161225754"
            adFormat="auto"
            fullWidthResponsive={true}
            className="w-full min-h-[250px]"
          />
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-4"
      >
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          {messages.map((msg, index) => (
            <MessageBubble
              is_custom_gpt={selectedAgentId ? true : false}
              provider={newChatModel.provider}
              key={msg.id || index}
              role={msg.role}
              content={msg.content}
              attachment={msg.attachment}
              attachments={msg.attachments}
              file_ids={msg.file_ids}
              isGeneratingImage={msg.isGeneratingImage} // Pass the skeleton state
              onDelete={msg.id ? () => deleteMessage(msg.id!) : undefined}
            />
          ))}

          {/* Loading Indicators */}
          {(isThinking || isLoading || isCreatingSession) && (
             location.pathname.startsWith("/pdf") ? (
                // Pulse Skeleton specifically for PDF Chat
                <div className="flex flex-col gap-3 mt-4 w-full px-4 text-left">
                   <div className="flex gap-4">
                     <SkeletonLoader count={1} className="w-8 h-8 rounded-full shrink-0" />
                     <div className="flex flex-col gap-2 w-full max-w-[85%]">
                        <SkeletonLoader count={1} className="h-4 w-11/12" />
                        <SkeletonLoader count={1} className="h-4 w-5/6" />
                        <SkeletonLoader count={1} className="h-4 w-4/6" />
                        <SkeletonLoader count={1} className="h-4 w-full" />
                        <SkeletonLoader count={1} className="h-4 w-3/4" />
                     </div>
                   </div>
                   {/* If uploading files (part of the pipeline), state it clearly */}
                   {fileUploadStage === "uploading" && (
                       <span className="text-xs text-blue-500 font-medium px-12 animate-pulse mt-2">
                           Uploading document securely...
                       </span>
                   )}
                   {fileUploadStage === "processing" && (
                       <span className="text-xs text-blue-500 font-medium px-12 animate-pulse mt-2">
                           Extracting text and generating summary...
                       </span>
                   )}
                </div>
             ) : (
                <ThinkingSkeleton 
                  isDark={isDark} 
                  provider={newChatModel.provider}
                  is_custom_gpt={selectedAgentId ? true : false}
                />
             )
          )}

          <div className="h-4" />
        </div>
      </div>

      {/* RIGHT AD - Positioned absolutely to not disturb layout - Shows for unauthenticated users and free tier users */}
      {isFree && (
        <div className="hidden lg:block fixed right-4 top-1/2 -translate-y-1/2 w-[160px] xl:w-[200px] z-[5]">
          <AdSense
            key="ad-right-chat-4237289443"
            adSlot="4237289443"
            adClient="ca-pub-2692304161225754"
            adFormat="auto"
            fullWidthResponsive={true}
            className="w-full min-h-[250px]"
          />
        </div>
      )}

      {/* Input Area */}
      <div
        className={cn(
          "flex-none w-full z-20 px-4 py-4",
          isDark ? "bg-background" : "bg-white"
        )}
      >
        <div className="w-full max-w-3xl mx-auto">
          <ChatInput
            features={features}
            disabled={isThinking || isStreaming || isCreatingSession || limitReached}
            onSend={handleSend}
            fileUploadStage={fileUploadStage}
          />
          {features && (
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-500">
                {t("chat.llmDisclaimer")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
