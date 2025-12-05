import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatInput from "../Chat/ChatInput";
import MessageBubble from "../MessageBubble";
import SkeletonLoader from "../ui/SkeletonLoader";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import {
  useGetMessagesQuery,
  useAddMessageMutation,
} from "../../store/apis/chatAPI";
import { generateAIResponse } from "../../utils/openai";
import { cn } from "../../utils/cn";

const ChatInterface: React.FC = () => {
  const { id } = useParams();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDark = useAppSelector((state) => state.theme.isDark);
  const user = useAppSelector((state) => state.auth.user);
  const currentModel = useAppSelector((state) => state.chat.currentModel); // Get selected model

  const { data: messages = [], isLoading } = useGetMessagesQuery(id || "", {
    skip: !id,
  });
  const [addMessage] = useAddMessageMutation();

  const [isTyping, setIsTyping] = useState(false);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!id || !user) return;

    try {
      // 1. User Message
      await addMessage({
        id: Date.now().toString(),
        chatId: id,
        role: "user" as const,
        content: text,
        timestamp: Date.now(),
      }).unwrap();

      setIsTyping(true);

      // 2. Call OpenAI with Specific Model
      const historyContext = messages
        .slice(-5)
        .map((m) => ({ role: m.role, content: m.content }));

      // PASS CURRENT MODEL ID HERE
      const aiText = await generateAIResponse(
        [...historyContext, { role: "user", content: text }],
        currentModel
      );

      // 3. AI Message
      await addMessage({
        id: (Date.now() + 1).toString(),
        chatId: id,
        role: "assistant",
        content: aiText || "Error generating response.",
        timestamp: Date.now(),
      }).unwrap();
    } catch (error) {
      console.error("Failed to send message", error);
      await addMessage({
        id: Date.now().toString(),
        chatId: id,
        role: "assistant",
        content:
          "I encountered an error processing your request. Please check your connection.",
        timestamp: Date.now(),
      });
    } finally {
      setIsTyping(false);
    }
  };

  if (!id) return null;

  return (
    <div className="flex flex-col h-full relative max-w-4xl mx-auto w-full overflow-hidden">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 scroll-smooth custom-scrollbar"
      >
        {isLoading ? (
          <div className="space-y-6 pt-10 px-4">
            <SkeletonLoader className="w-1/2 h-16 ml-auto rounded-tr-none" />
            <SkeletonLoader className="w-3/4 h-24 mr-auto rounded-tl-none" />
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40 animate-in fade-in">
                <div className="text-6xl mb-4 grayscale">💬</div>
                <p className="font-medium text-lg">Start a conversation</p>
                <p className="text-xs mt-2 opacity-70">Using {currentModel}</p>
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
        {isTyping && (
          <div className="ml-4 mt-2 text-xs opacity-50 animate-pulse flex items-center gap-2">
            <span>{currentModel} is thinking...</span>
          </div>
        )}
      </div>

      <div
        className={cn(
          "w-full pb-6 pt-2 px-4 z-10",
          isDark ? "bg-[#212121]/90" : "bg-white/90"
        )}
      >
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatInterface;
