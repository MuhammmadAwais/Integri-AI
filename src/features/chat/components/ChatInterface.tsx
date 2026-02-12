import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ChatInput from "./ChatInput";
import MessageBubble from "../../../Components/ui/MessageBubble";
import SkeletonLoader from "../../../Components/ui/SkeletonLoader";
import { useAppSelector } from "../../../hooks/useRedux";
import { useChat } from "../hooks/useChat";
import { cn } from "../../../lib/utils";
import { ChatService } from "../services/chatService";
import { SessionService } from "../../../api/backendApi";
import AdSense from "../../../Components/ui/AdSense";

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

  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const {
    messages,
    sendMessage,
    deleteMessage,
    isLoading,
    isStreaming,
    isThinking,
    messagesLoaded, // <--- Now available
  } = useChat(id, location.state?.initialMessage, location.state?.initialFile);

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
      const { initialMessage, initialFile } = location.state;

      // Always call sendMessage - it will check if message exists and avoid duplicates
      // but will still send via socket if needed
      sendMessage(initialMessage, initialFile);

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
  const handleSend = async (text: string, file?: File | null, searchMode?: "search" | "deep-search" | null) => {
    if (!text.trim() && !file) return;

    // Override model if search mode is active
    let modelId = newChatModel.id;
    if (searchMode === "search") {
      modelId = "gpt-4o-mini-search-preview";
    } else if (searchMode === "deep-search") {
      modelId = "gpt-4o-mini-deep-research";
    }

    if (id) {
      // For existing chats, we need to update the model in useChat
      // For now, send with the search model override
      sendMessage(text, file, modelId);
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
          initialFile: file,
          model: modelId,
        },
      });
    } catch (error) {
      console.error("Failed to create session:", error);
      setIsCreatingSession(false);
    }
  };
  console.log(messages)
  return (
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden relative">
      {/* LEFT AD - Positioned absolutely to not disturb layout */}
      {/* Account for sidebar width (240px) + margin */}
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
              isGeneratingImage={msg.isGeneratingImage} // Pass the skeleton state
              onDelete={msg.id ? () => deleteMessage(msg.id!) : undefined}
            />
          ))}

          {/* Loading Indicators */}
          {(isThinking || isLoading || isCreatingSession) && (
            <div className="flex justify-start">
              <SkeletonLoader />
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>

      {/* RIGHT AD - Positioned absolutely to not disturb layout */}
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
            disabled={isThinking || isStreaming || isCreatingSession}
            onSend={handleSend}
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
