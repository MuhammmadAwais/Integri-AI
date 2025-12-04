import React, { useLayoutEffect, useRef } from "react";

import { cn } from "../utils/cn";
import gsap from "gsap";
import { User, Bot } from "lucide-react";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

const MessageBubble: React.FC<MessageProps> = ({ role, content }) => {

  const bubbleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(bubbleRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: "back.out(1.2)",
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
          "flex max-w-[85%] gap-3",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm border",
            isUser
              ? "bg-[#2F3136] border-gray-700 text-white"
              : "bg-linear-to-tr from-indigo-500 to-purple-600 text-white border-transparent"
          )}
        >
          {isUser ? <User size={14} /> : <Bot size={16} />}
        </div>

        {/* Bubble */}
        <div
          className={cn(
            "px-5 py-3 text-sm leading-relaxed shadow-md",
            isUser
              ? "bg-[#2F3136] text-white rounded-2xl rounded-tr-sm border border-gray-700"
              : "bg-transparent text-gray-100 pl-0 pt-1" // AI message looks cleaner without background
          )}
        >
          {content.split("```").map((part, i) => {
            if (i % 2 === 1) {
              return (
                <div
                  key={i}
                  className="bg-black/50 p-3 rounded-md font-mono text-xs my-2 overflow-x-auto"
                >
                  {part}
                </div>
              );
            }
            return (
              <span key={i} className="whitespace-pre-wrap">
                {part}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
