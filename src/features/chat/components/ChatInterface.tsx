import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ChatInput from "./ChatInput";
import MessageBubble from "../../../Components/ui/MessageBubble";
import SkeletonLoader from "../../../Components/ui/SkeletonLoader";
import { useAppSelector } from "../../../hooks/useRedux";
import { useMessages } from "../hooks/useChat";
import { ChatService } from "../services/chatService";
import { cn } from "../../../lib/utils";

const ChatInterface: React.FC = () => {
  const { id } = useParams();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const user = useAppSelector((state: any) => state.auth?.user);
  const currentModel = useAppSelector((state: any) => state.chat.currentModel);

  // Data Fetching
  const { messages, loading: isLoadingMessages } = useMessages(user?.id, id);
  const [isGenerating, setIsGenerating] = useState(false);

  // Scroll to bottom efficiently
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  // Initial load scroll
  useEffect(() => {
    if (!isLoadingMessages) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isLoadingMessages]);

  const handleSendMessage = async (text: string) => {
    if (!id || !user?.id) return;

    setIsGenerating(true);
    try {
      // ChatService handles DB saving and AI response generation
      await ChatService.sendMessage(user.id, id, text, currentModel);
    } catch (error) {
      console.error("Send Error:", error);
    } finally {
      setIsGenerating(false);
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
      {/* Scrollable Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-0 scroll-smooth custom-scrollbar"
      >
        <div className="max-w-3xl mx-auto w-full pb-32 pt-6 md:pt-10 px-4 md:px-0">
          {isLoadingMessages ? (
            <div className="space-y-8 pt-10">
              <SkeletonLoader className="w-1/3 h-10 ml-auto rounded-3xl bg-gray-800" />
              <div className="space-y-2">
                <SkeletonLoader className="w-3/4 h-4 mr-auto rounded-md bg-gray-800" />
                <SkeletonLoader className="w-1/2 h-4 mr-auto rounded-md bg-gray-800" />
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="h-[60vh] flex flex-col items-center justify-center opacity-40">
                  <div className="text-6xl mb-6 grayscale">⚡</div>
                  <h2 className="font-bold text-2xl mb-2">Grok is ready</h2>
                  <p className="text-sm text-gray-500">
                    Ask about anything, anytime.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                  />
                ))
              )}
            </>
          )}
          {isGenerating && (
            <div className="flex items-center gap-2 text-gray-500 ml-4 text-sm font-mono mt-4">
              <span className="animate-pulse">Thinking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Input Area */}
      <div
        className={cn(
          "absolute bottom-0 left-0 w-full z-20 pt-10 pb-6 px-4",
          isDark
            ? "bg-linear-to-t from-[#000000] via-[#000000] to-transparent"
            : "bg-linear-to-t from-white via-white to-transparent"
        )}
      >
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};
export default ChatInterface;
