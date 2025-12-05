import React, { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import gsap from "gsap";
import {
  Copy,
  RotateCcw,
  Volume2,
  MessageSquare,
  Share,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Check,
} from "lucide-react";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

const MessageBubble: React.FC<MessageProps> = ({ role, content }) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useLayoutEffect(() => {
    // Safety check: ensure ref exists and gsap is available
    if (bubbleRef.current && gsap) {
      const ctx = gsap.context(() => {
        gsap.from(bubbleRef.current, {
          y: 10,
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }, bubbleRef);
      return () => ctx.revert();
    }
  }, []);

  const isUser = role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={bubbleRef}
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div className={cn("flex flex-col max-w-[90%] md:max-w-[80%] min-w-0")}>
        {/* Content Bubble */}
        <div
          className={cn(
            "px-5 py-3 text-[15px] leading-relaxed shadow-sm overflow-hidden wrap-break-words",
            isUser
              ? "bg-[#212121] text-white rounded-4xl rounded-tr-lg"
              : "bg-transparent text-gray-100 pl-0 pt-0"
          )}
        >
          {content.split("```").map((part, i) => {
            if (i % 2 === 1) {
              return (
                <div
                  key={i}
                  className="bg-[#1e1e1e] border border-gray-800 p-3 rounded-lg font-mono text-sm my-3 overflow-x-auto w-full"
                >
                  <pre className="whitespace-pre">{part}</pre>
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

        {/* Action Bar (Assistant Only) */}
        {!isUser && (
          <div className="flex items-center gap-4 mt-2 ml-0 text-gray-500 select-none">
            <button
              className="hover:text-white transition-colors p-1"
              title="Regenerate"
            >
              <RotateCcw size={16} strokeWidth={1.5} />
            </button>
            <button
              className="hover:text-white transition-colors p-1"
              title="Read Aloud"
            >
              <Volume2 size={16} strokeWidth={1.5} />
            </button>
            <button title="Reply" className="hover:text-white transition-colors p-1 hidden sm:block">
              <MessageSquare size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={handleCopy}
              className="hover:text-white transition-colors p-1"
              title="Copy"
            >
              {copied ? (
                <Check size={16} />
              ) : (
                <Copy size={16} strokeWidth={1.5} />
              )}
            </button>
            <button title="Share" className="hover:text-white transition-colors p-1 hidden sm:block">
              <Share size={16} strokeWidth={1.5} />
            </button>
            <button title="Like" className="hover:text-white transition-colors p-1">
              <ThumbsUp size={16} strokeWidth={1.5} />
            </button>
            <button title="Dislike" className="hover:text-white transition-colors p-1">
              <ThumbsDown size={16} strokeWidth={1.5} />
            </button>
            <button title="More options" className="hover:text-white transition-colors p-1">
              <MoreHorizontal size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
