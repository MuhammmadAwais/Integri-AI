import React, { useEffect, useRef, useState } from "react";
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

  // Hook handles fetching history
  const { messages, sendMessage, deleteMessage, isLoading, isStreaming } =
    useChat(id);

  // REF prevents duplicate sends in React Strict Mode
  const hasInitialized = useRef(false);

  // 1. ROBUST WELCOME MESSAGE LOGIC
  useEffect(() => {
    // Only run if we have an ID, a welcome message exists, and we haven't run this yet.
    if (id && location.state?.initialMessage && !hasInitialized.current) {
      hasInitialized.current = true; // Lock immediately

      const msg = location.state.initialMessage;

      console.log("🚀 Sending Welcome Message:", msg);
      sendMessage(msg);

      // Rename Chat (API Call)
      if (token) {
        SessionService.updateSession(token, id, msg.substring(0, 30));
      }

      // Clear navigation state so refresh doesn't resend
      window.history.replaceState({}, document.title);
    }
  }, [id, location.state, token, sendMessage]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Regenerate Logic
  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  };

  if (!id) return null;

  return (
    <div
      className={cn(
        "flex flex-col h-full relative w-full overflow-hidden",
        isDark ? "bg-[#000000]" : "bg-white"
      )}
    >
      {/* Messages Area - Added extra padding bottom (pb-48) to clear the input */}
      <div
        className="flex-1 overflow-y-auto scrollbar-hide w-full"
        ref={scrollRef}
      >
        <div className="w-full max-w-3xl mx-auto pt-20 pb-48">
          {isLoading && messages.length === 0 ? (
            <div className="space-y-6 px-4">
              <SkeletonLoader className="h-12 w-3/4 rounded-r-xl rounded-bl-xl ml-auto bg-gray-200 dark:bg-gray-800" />
              <div className="flex gap-4">
                <SkeletonLoader className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
                <SkeletonLoader className="h-24 w-full rounded-r-xl rounded-bl-xl bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 && !hasInitialized.current ? (
                <div className="h-[60vh] flex flex-col items-center justify-center opacity-40">
                  <div className="text-6xl mb-6 grayscale">⚡</div>
                  <h2 className="font-bold text-2xl mb-2">
                    Integri AI is ready
                  </h2>
                  <p className="text-sm text-gray-500">
                    Ask about anything, anytime.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <MessageBubble
                    // Prefer actual ID, fallback to index for temp messages
                    key={msg.id || index}
                    id={msg.id}
                    role={msg.role}
                    content={msg.content}
                    // IMPORTANT: Pass the delete function explicitly
                    onDelete={deleteMessage}
                    onRegenerate={handleRegenerate}
                  />
                ))
              )}
            </>
          )}

          {isStreaming && (
            <div className="flex items-center gap-2 text-gray-500 ml-16 text-sm font-mono mt-2 mb-4">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <span className="animate-pulse">Thinking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Area - z-index ensures it sits on top */}
      <div
        className={cn(
          "absolute bottom-0 left-0 w-full z-30 pt-10 pb-6 px-4",
          isDark
            ? "bg-gradient-to-t from-black via-black to-transparent"
            : "bg-gradient-to-t from-white via-white to-transparent"
        )}
      >
        <div className="w-full max-w-3xl mx-auto">
          <ChatInput
            onSend={(text) => {
              sendMessage(text);
              if (messages.length === 0 && token) {
                SessionService.updateSession(token, id, text.substring(0, 30));
              }
            }}
          />
          <div className="text-center mt-3">
            <span className="text-[10px] text-gray-400">
              Integri AI can make mistakes. Check important info.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
