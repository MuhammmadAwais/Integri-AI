import React, { useLayoutEffect, useRef } from "react";
import { useAppSelector } from "./hooks/useRedux";
import { cn } from "../utils/cn";
import gsap from "gsap";
import { User, Bot, Copy } from "lucide-react";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

const MessageBubble: React.FC<MessageProps> = ({ role, content }) => {
  const isDark = useAppSelector((state) => state.theme.isDark);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(bubbleRef.current, {
        y: 10,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }, bubbleRef);
    return () => ctx.revert();
  }, []);

  const isUser = role === "user";

  // Code Block Formatter
  const renderContent = (text: string) => {
    const parts = text.split(/```/);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <div
            key={index}
            className="my-2 rounded-md overflow-hidden bg-black/80 text-white text-xs font-mono shadow-sm"
          >
            <div className="bg-white/10 px-3 py-1 flex justify-between items-center select-none">
              <span>Code</span>
              <div className="flex items-center gap-1 cursor-pointer hover:text-white/80">
                <Copy size={12} />
                <span>Copy</span>
              </div>
            </div>
            <div className="p-3 overflow-x-auto custom-scrollbar">
              {part.trim()}
            </div>
          </div>
        );
      }
      return (
        <span key={index} className="whitespace-pre-wrap wrap-break-words">
          {part}
        </span>
      );
    });
  };

  return (
    <div
      ref={bubbleRef}
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Fix: items-start aligns avatar with top of message. 
         max-w-[85%] limits width. 
      */}
      <div
        className={cn(
          "flex items-start max-w-[90%] md:max-w-[75%] gap-3 md:gap-4",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center shadow-sm select-none",
            isUser
              ? "bg-linear-to-tr from-blue-600 to-indigo-600 text-white"
              : isDark
              ? "bg-[#19c37d] text-white"
              : "bg-green-600 text-white"
          )}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Message Content */}
        <div
          className={cn(
            "p-3 md:p-4 rounded-2xl text-sm leading-relaxed shadow-sm min-w-[60px]",
            isUser
              ? isDark
                ? "bg-[#3E3F4B] text-white rounded-tr-sm"
                : "bg-indigo-600 text-white rounded-tr-sm"
              : isDark
              ? "bg-[#444654] text-gray-100 rounded-tl-sm"
              : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
          )}
        >
          {renderContent(content)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
