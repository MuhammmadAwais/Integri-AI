import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ChatInput from "../Chat/ChatInput";
import MessageBubble from "../MessageBubble";
import SkeletonLoader from "../ui/SkeletonLoader";
import { useAppSelector } from "../hooks/useRedux";
import {
  useGetMessagesQuery,
  useAddMessageMutation,
  useAddChatMutation,
  useGetChatsQuery,
} from "../../store/apis/chatAPI";
import { generateAIResponse } from "../../utils/openai";
import { cn } from "../../utils/cn";

const ChatInterface: React.FC = () => {
  const { id } = useParams();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isDark = useAppSelector((state) => state.theme.isDark);
  const user = useAppSelector((state) => state.auth.user);
  const currentModel = useAppSelector((state) => state.chat.currentModel);

  // 1. Fetch Messages
  const { data: messages = [], isLoading: isLoadingMessages } =
    useGetMessagesQuery(id || "", { skip: !id });

  const { data: existingChats = [] } = useGetChatsQuery(user?.id || "", {
    skip: !user,
  });

  const [addMessage] = useAddMessageMutation();
  const [addChat] = useAddChatMutation();

  // State to track if we are currently generating a response to avoid duplicate calls
  const [isGenerating, setIsGenerating] = useState(false);

  // Determine typing state: if generating locally or if fetching implies logic
  const isTyping =
    isGenerating ||
    (messages.length > 0 && messages[messages.length - 1].role === "user");

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // --- NEW LOGIC: Handle Pending AI Response ---
  // If the component loads (e.g. from Welcome screen) and the last message is User, trigger AI.
  useEffect(() => {
    const processPendingMessage = async () => {
      if (messages.length === 0) return;

      const lastMsg = messages[messages.length - 1];

      // If last message is user and we aren't already generating
      if (lastMsg.role === "user" && !isGenerating) {
        setIsGenerating(true);
        try {
          // Prepare history
          const historyContext = messages
            .slice(-6, -1) // Take previous messages excluding the very last pending one
            .map((m) => ({ role: m.role, content: m.content }));

          const aiText = await generateAIResponse(
            [...historyContext, { role: "user", content: lastMsg.content }],
            currentModel
          );

          await addMessage({
            id: Date.now().toString(),
            chatId: id!,
            role: "assistant",
            content:
              aiText ||
              "I apologize, but I couldn't generate a response at this time.",
            timestamp: Date.now(),
          }).unwrap();
        } catch (error) {
          console.error("Auto-response error:", error);
        } finally {
          setIsGenerating(false);
        }
      }
    };

    if (!isLoadingMessages && id) {
      processPendingMessage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoadingMessages, id, currentModel]); // Check when messages update

  const handleSendMessage = async (text: string) => {
    if (!id || !user) return;

    try {
      // FIX: Ensure Chat Parent Record Exists (Redundant if handled by Welcome, but good safety)
      const chatExists = existingChats.some((c) => c.id === id);
      if (!chatExists) {
        await addChat({
          id: id,
          userId: user.id,
          title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
          date: new Date().toISOString(),
          preview: text.slice(0, 50),
          model: currentModel,
        }).unwrap();
      }

      // 1. Add User Message
      await addMessage({
        id: Date.now().toString(),
        chatId: id,
        role: "user" as const,
        content: text,
        timestamp: Date.now(),
      }).unwrap();

      // The useEffect above will detect this new 'user' message and trigger the AI response automatically.
      // This keeps logic in one place.
    } catch (error) {
      console.error("Failed to send message", error);
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
      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth custom-scrollbar"
      >
        <div className="max-w-3xl mx-auto w-full pb-10">
          {isLoadingMessages ? (
            <div className="space-y-8 pt-10">
              <SkeletonLoader
                className={cn(
                  "w-1/3 h-10 ml-auto rounded-3xl",
                  isDark ? "bg-gray-800" : "bg-gray-200"
                )}
              />
              <div className="space-y-2">
                <SkeletonLoader
                  className={cn(
                    "w-3/4 h-4 mr-auto rounded-md",
                    isDark ? "bg-gray-800" : "bg-gray-200"
                  )}
                />
                <SkeletonLoader
                  className={cn(
                    "w-1/2 h-4 mr-auto rounded-md",
                    isDark ? "bg-gray-800" : "bg-gray-200"
                  )}
                />
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40 mt-20">
                  <div className="text-4xl mb-4 grayscale">👋</div>
                  <p className="font-medium text-lg">
                    How can I help you today?
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
          {isTyping && (
            <div className="mt-4 text-gray-400 text-sm flex items-center gap-2 animate-pulse">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div
        className={cn(
          "w-full pb-6 pt-2 px-4 z-10",
          isDark ? "bg-[#000000]" : "bg-white"
        )}
      >
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSendMessage} />
          <p
            className={cn(
              "text-center text-[10px] mt-2",
              isDark ? "text-gray-600" : "text-gray-400"
            )}
          >
            AI can make mistakes. Please double check responses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
