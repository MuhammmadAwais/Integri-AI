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

  const processedMessageIds = useRef<Set<string>>(new Set());

  const isDark = useAppSelector((state) => state.theme.isDark);
  const user = useAppSelector((state) => state.auth?.user);
  const currentUserId = user?.id || "guest";
  const currentModel = useAppSelector((state) => state.chat.currentModel);

  const { data: messages = [], isLoading: isLoadingMessages } =
    useGetMessagesQuery(id || "", { skip: !id });

  const { data: existingChats = [] } = useGetChatsQuery(currentUserId, {
    skip: !currentUserId,
  });

  const [addMessage] = useAddMessageMutation();
  const [addChat] = useAddChatMutation();
  const [isGenerating, setIsGenerating] = useState(false);

  const isTyping =
    isGenerating ||
    (messages.length > 0 && messages[messages.length - 1].role === "user");

  // Improved Auto-scroll: Runs when messages change
  useEffect(() => {
    if (scrollRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const processAI = async () => {
      if (!id || messages.length === 0) return;

      const lastMsg = messages[messages.length - 1];

      if (
        lastMsg.role === "user" &&
        !isGenerating &&
        !processedMessageIds.current.has(lastMsg.id)
      ) {
        setIsGenerating(true);
        processedMessageIds.current.add(lastMsg.id);

        try {
          const historyContext = messages
            .slice(-6, -1)
            .map((m) => ({ role: m.role, content: m.content }));

          const aiText = await generateAIResponse(
            [...historyContext, { role: "user", content: lastMsg.content }],
            currentModel
          );

          await addMessage({
            id: crypto.randomUUID(),
            chatId: id,
            role: "assistant",
            content: aiText,
            timestamp: Date.now(),
          }).unwrap();
        } catch (error) {
          console.error("Auto-response error:", error);
          processedMessageIds.current.delete(lastMsg.id);
        } finally {
          setIsGenerating(false);
        }
      }
    };

    if (!isLoadingMessages) {
      processAI();
    }
  }, [messages, isLoadingMessages, id, currentModel, addMessage]);

  const handleSendMessage = async (text: string) => {
    if (!id) return;

    try {
      const chatExists = existingChats.some((c) => c.id === id);
      if (!chatExists) {
        await addChat({
          id: id,
          userId: currentUserId,
          title: text.slice(0, 30) + "...",
          date: new Date().toISOString(),
          preview: text.slice(0, 50),
          model: currentModel,
        }).unwrap();
      }

      const newMessageId = crypto.randomUUID();
      await addMessage({
        id: newMessageId,
        chatId: id,
        role: "user",
        content: text,
        timestamp: Date.now(),
      }).unwrap();
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
        {/* Extra bottom padding allows last message to clear input area */}
        <div className="max-w-3xl mx-auto w-full pb-24">
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
            <div className="mt-4 text-gray-400 text-sm flex items-center gap-2 animate-pulse ml-4">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div
        className={cn(
          "absolute bottom-0 left-0 w-full pb-6 pt-2 px-4 z-10",
          isDark
            ? "bg-linear-to-t from-[#000000] via-[#000000] to-transparent"
            : "bg-linear-to-t from-white via-white to-transparent"
        )}
      >
        <div className="max-w-3xl mx-auto">
          <ChatInput onSend={handleSendMessage} />
          <p className="text-center text-[10px] mt-2 text-gray-500">
            AI can make mistakes. Please double check responses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
