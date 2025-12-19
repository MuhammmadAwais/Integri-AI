import React, { useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import ChatInput from "./ChatInput";
import MessageBubble from "../../../Components/ui/MessageBubble";
import SkeletonLoader from "../../../Components/ui/SkeletonLoader";
import { useAppSelector } from "../../../hooks/useRedux";
import { useChat } from "../hooks/useChat";
import { cn } from "../../../lib/utils";
import { SessionService } from "../../../api/backendApi";

const ChatInterface: React.FC = () => {
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

  // 1. Handle Welcome Page Transition
  useEffect(() => {
    if (id && location.state?.initialMessage && !hasInitialized.current) {
      hasInitialized.current = true;
      const initialText = location.state.initialMessage;

      // Optimistically show and send
      sendMessage(initialText);

      // Update Title in background
      if (token) {
        SessionService.updateSession(token, id, initialText.substring(0, 30));
      }
    }
  }, [id, location.state, sendMessage, token]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, isThinking]);

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Messages */}
          {isLoading && messages.length === 0 ? (
            <div className="space-y-4 mt-8">
              <SkeletonLoader />
              <SkeletonLoader />
            </div>
          ) : (
            messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id || idx}
                role={msg.role}
                content={msg.content}
                onDelete={deleteMessage}
              />
            ))
          )}

          {/* Thinking / Streaming Indicator */}
          {(isThinking || isStreaming) && (
            <div className="flex items-center gap-2 text-gray-500 ml-16 text-sm font-mono mt-2 mb-4">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
              <span className="animate-pulse">
                {isStreaming ? "Generating..." : "Thinking..."}
              </span>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 w-full z-30 pt-10 pb-6 px-4",
          isDark
            ? "bg-linear-to-t from-black via-black to-transparent"
            : "bg-linear-to-t from-white via-white to-transparent"
        )}
      >
        <div className="w-full max-w-3xl mx-auto">
          <ChatInput
            onSend={(text) => {
              sendMessage(text);
              // Set title for fresh chats
              if (messages.length === 0 && token && id) {
                SessionService.updateSession(token, id, text.substring(0, 30));
              }
            }}
            disabled={isThinking || isStreaming}
          />
          <div className="text-center mt-3">
            <span className="text-xs text-gray-500">
              AI can make mistakes. Check important info.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
