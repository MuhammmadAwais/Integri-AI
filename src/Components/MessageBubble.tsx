import React, { useLayoutEffect, useRef } from "react";
import { useAppSelector } from "./hooks/useRedux";
import { cn } from "../utils/cn";
import gsap from "gsap";
import { User, Bot } from "lucide-react";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

const MessageBubble: React.FC<MessageProps> = ({ role, content }) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // Animate on mount
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(bubbleRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: "back.out(1.7)",
      });
    }, bubbleRef);
    return () => ctx.revert();
  }, []);

  const isUser = role === "user";

  return (
    <div
      ref={bubbleRef}
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] md:max-w-[75%] gap-4",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center shadow-sm",
            isUser
              ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
              : isDark
              ? "bg-[#19c37d] text-white"
              : "bg-green-600 text-white" // ChatGPT style colors
          )}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Message Content */}
        <div
          className={cn(
            "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
            isUser
              ? isDark
                ? "bg-[#2A2B32] text-gray-100 rounded-tr-sm"
                : "bg-indigo-600 text-white rounded-tr-sm"
              : isDark
              ? "bg-transparent text-gray-100 pl-0 pt-1"
              : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
          )}
        >
          <p className="whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
