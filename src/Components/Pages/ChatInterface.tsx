import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ChatInput from "../Chat/ChatInput";
import MessageBubble from "../MessageBubble";
import SkeletonLoader from "../ui/SkeletonLoader";
import { useAppSelector } from "../hooks/useRedux";
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

  // RTK Query Hooks
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
      // 1. Save User Message to DB
      const userMsgPayload = {
        id: Date.now().toString(),
        chatId: id,
        role: "user" as const,
        content: text,
        timestamp: Date.now(),
      };
      await addMessage(userMsgPayload).unwrap();

      setIsTyping(true);

      // 2. Call Real OpenAI API
      // We pass the last few messages for context
      const historyContext = messages
        .slice(-5)
        .map((m) => ({ role: m.role, content: m.content }));
      const aiText = await generateAIResponse([
        ...historyContext,
        { role: "user", content: text },
      ]);

      // 3. Save AI Message to DB
      await addMessage({
        id: (Date.now() + 1).toString(),
        chatId: id,
        role: "assistant",
        content: aiText || "Sorry, I couldn't generate a response.",
        timestamp: Date.now(),
      }).unwrap();
    } catch (error) {
      console.error("Failed to send message", error);
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
          <div className="ml-4 mt-2 text-xs opacity-50 animate-pulse">
            Integri AI is thinking...
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
