import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatInput from "../Chat/ChatInput";
import MessageBubble from "../MessageBubble";
import SkeletonLoader from "../ui/SkeletonLoader";
import { useAppDispatch, useAppSelector } from "../hooks/useRedux";
import { addMessageToChat, createNewChat } from "../../store/chatSlice";
import { cn } from "../../utils/cn";

const ChatInterface: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDark = useAppSelector((state) => state.theme.isDark);

  const sessions = useAppSelector((state) => state.chat.sessions);

  // Get Session
  const session = sessions.find((s) => s.id === id);

  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true); // NEW: Track scroll intent

  // 1. Handle ID Change & cleanup
  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    setIsLoading(true);
    setShouldAutoScroll(true); // Reset scroll on new chat

    const existingSession = sessions.find((s) => s.id === id);
    if (!existingSession) {
      dispatch(createNewChat({ id, title: "New Conversation" }));
    }

    const timer = setTimeout(() => setIsLoading(false), 300); // Faster load
    return () => clearTimeout(timer);
  }, [id, dispatch]);

  // 2. Smart Scroll Logic
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShouldAutoScroll(isAtBottom);
  };

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages, isTyping, isLoading, shouldAutoScroll]);

  const handleSendMessage = (text: string) => {
    if (!id) return;
    setShouldAutoScroll(true); // Force scroll on send

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

    setTimeout(() => {
      dispatch(
        addMessageToChat({
          chatId: id,
          message: {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `Response to: "${text}".\n\n\`\`\`javascript\nconsole.log("Code block test");\n\`\`\``,
            timestamp: Date.now(),
          },
        })
      );
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full relative max-w-4xl mx-auto w-full">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth"
      >
        {isLoading ? (
          <div className="space-y-6 pt-10 px-4 max-w-2xl mx-auto">
            <div className="flex justify-end">
              <SkeletonLoader className="w-1/2 h-16 rounded-2xl rounded-tr-none" />
            </div>
            <div className="flex justify-start">
              <SkeletonLoader className="w-3/4 h-24 rounded-2xl rounded-tl-none" />
            </div>
          </div>
        ) : (
          <>
            {!session || session.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-40 animate-in fade-in duration-500">
                <div className="text-6xl mb-4 grayscale">💬</div>
                <p className="font-medium text-lg">Start a conversation</p>
              </div>
            ) : (
              session.messages.map((msg) => (
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
