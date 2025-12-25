import React, { useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import ChatInput from "./ChatInput";
import MessageBubble from "../../../Components/ui/MessageBubble";
import SkeletonLoader from "../../../Components/ui/SkeletonLoader";
import { useAppSelector } from "../../../hooks/useRedux";
import { useChat } from "../hooks/useChat";
import { cn } from "../../../lib/utils";
import { SessionService } from "../../../api/backendApi";

interface ChatInterfaceProps {
  features?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ features = true }) => {
  const { id } = useParams();
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const token = useAppSelector((state: any) => state.auth.accessToken);

  const {
    messages,
    sendMessage,
    deleteMessage,
    isLoading,
    isStreaming,
    isThinking,
  } = useChat(id);

  const hasInitialized = useRef(false);

  // 1. Handle Welcome Page Transition & PDF Auto-Send
  useEffect(() => {
    if (id && location.state?.initialMessage && !hasInitialized.current) {
      hasInitialized.current = true;
      const { initialMessage, initialFile } = location.state;

      // Optimistically show and send (Pass File if present)
      sendMessage(initialMessage, initialFile);

      // Clear state to prevent re-sending on refresh
      window.history.replaceState({}, document.title);
    }
  }, [id, location.state, sendMessage]);

  // 2. SCROLL LOGIC: Only scroll on NEW USER messages.
  // The user requested: "when responce come my screen dont automatically scroll down"
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // Only scroll if the last message is from the user (they just sent it)
    // OR if it's the very first load.
    if (lastMessage?.role === "user" && !isStreaming) {
      scrollToBottom();
    }
    // Note: We intentionally exclude scrolling on 'assistant' messages or 'isStreaming' updates
  }, [messages.length, isStreaming]); // Depend on length so it fires when count changes, not content

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    // Switch to Flexbox Layout to ensure Input is ALWAYS fixed at bottom
    <div className="flex flex-col h-full w-full bg-transparent overflow-hidden">
      {/* Messages Area - Flex Grow */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-4"
      >
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          {messages.map((msg, index) => (
            <MessageBubble
              key={msg.id || index}
              role={msg.role}
              content={msg.content}
              attachment={msg.attachment}
              onDelete={msg.id ? () => deleteMessage(msg.id!) : undefined}
            />
          ))}

          {/* Loading / Thinking Indicators */}
          {(isThinking || isLoading) && (
            <div className="flex justify-start">
              <SkeletonLoader />
            </div>
          )}

          {/* Spacer for bottom scrolling */}
          <div className="h-4" />
        </div>
      </div>

      {/* Input Area - Flex None (Fixed) */}
      <div
        className={cn(
          "flex-none w-full z-20 px-4 py-4",
          isDark
            ? "bg-background "
            : "bg-white "
        )}
      >
        <div className="w-full max-w-3xl mx-auto">
          <ChatInput
            features={features}
            disabled={isThinking || isStreaming}
            onSend={(text, file) => {
              sendMessage(text, file);

              // Set title for fresh chats
              if (messages.length === 0 && token && id) {
                const cleanText = text.trim();
                const title = cleanText
                  ? cleanText.substring(0, 30)
                  : file
                  ? "Attachment"
                  : "New Chat";

                SessionService.updateSession(token, id, title);
              }
              // Force scroll when user sends
              setTimeout(scrollToBottom, 100);
            }}
          />
          {features && (
            <div className="text-center mt-2">
              <span className="text-[10px] text-gray-500">
                AI can make mistakes. Check important info.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
