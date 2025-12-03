import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ChatInput from "../Chat/ChatInput";
import MessageBubble from "../MessageBubble";
import SkeletonLoader from "../ui/SkeletonLoader"; // Import Skeleton
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { addMessageToChat, createNewChat } from "../../store/chatSlice";
import { cn } from "../../utils/cn";
import gsap from "gsap";

const ChatInterface: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Get chat data from Redux
  const session = useAppSelector((state) =>
    state.chat.sessions.find((s) => s.id === id)
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Simulate "Fetching" effect when ID changes
  useEffect(() => {
    setIsLoading(true);

    // If ID exists but no session, create one (Handle direct URL access)
    if (!session && id) {
      dispatch(createNewChat({ id, title: "New Conversation" }));
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // 800ms "fake" network load

    return () => clearTimeout(timer);
  }, [id, dispatch]); // Removed 'session' from dependencies to prevent loop

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages, isLoading, isTyping]);

  const handleSendMessage = (text: string) => {
    if (!id) return;

    // 1. Add User Message
    dispatch(
      addMessageToChat({
        chatId: id,
        message: {
          id: Date.now().toString(),
          role: "user",
          content: text,
          timestamp: Date.now(),
        },
      })
    );

    setIsTyping(true);

    // 2. Simulate AI Response
    setTimeout(() => {
      dispatch(
        addMessageToChat({
          chatId: id,
          message: {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `I am an AI response to: "${text}". \n\nI remember this conversation context now!`,
            timestamp: Date.now(),
          },
        })
      );
      setIsTyping(false);
    }, 1500);
  };

  // --- VIEW RENDERING ---
  return (
    <div className="flex flex-col h-full relative max-w-4xl mx-auto w-full">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth"
      >
        {/* Case 1: Loading State (Skeleton) */}
        {isLoading ? (
          <div className="space-y-6 pt-10 px-4">
            <div className="flex justify-end">
              <SkeletonLoader className="w-1/2 h-16 rounded-2xl rounded-tr-none" />
            </div>
            <div className="flex justify-start">
              <SkeletonLoader className="w-3/4 h-24 rounded-2xl rounded-tl-none" />
            </div>
            <div className="flex justify-end">
              <SkeletonLoader className="w-1/3 h-12 rounded-2xl rounded-tr-none" />
            </div>
          </div>
        ) : (
          /* Case 2: Message List */
          <>
            {session?.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <div className="text-4xl mb-4">🤖</div>
                <p>Start chatting with Integri AI</p>
              </div>
            ) : (
              session?.messages.map((msg) => (
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
            AI is thinking...
          </div>
        )}
      </div>

      <div className="w-full pb-6 pt-2 px-4 z-10">
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatInterface;
