import React, { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import gsap from "gsap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
import { useAppSelector } from "./hooks/useRedux";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

const MessageBubble: React.FC<MessageProps> = ({ role, content }) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const isDark = useAppSelector((state) => state.theme.isDark);

  useLayoutEffect(() => {
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
      <div className={cn("flex flex-col max-w-[90%] md:max-w-[85%] min-w-0")}>
        {/* Content Bubble */}
        <div
          className={cn(
            "px-5 py-3 text-[15px] leading-relaxed  overflow-hidden wrap-break-words",
            isDark ? (isUser
              ? "bg-[#212121] text-white rounded-4xl rounded-tr-lg"
              : "bg-transparent text-black pl-0 pt-0"):
            (isUser
              ? "bg-[#212121] text-white rounded-4xl rounded-tr-lg"
              : "bg-transparent text-black pl-0 pt-0")
          )}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{content}</div>
          ) : (
            <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-lg">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-4 border border-gray-700 rounded-lg">
                      <table
                        className="min-w-full divide-y divide-gray-700 text-sm"
                        {...props}
                      />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead
                      className="bg-[#2a2a2a] text-gray-200 font-semibold"
                      {...props}
                    />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="px-4 py-3 text-left" {...props} />
                  ),
                  tbody: ({ node, ...props }) => (
                    <tbody
                      className="divide-y divide-gray-800 text-black bg-transparent"
                      {...props}
                    />
                  ),
                  tr: ({ node, ...props }) => (
                    <tr
                      className="hover:bg-white/5 transition-colors"
                      {...props}
                    />
                  ),
                  td: ({ node, ...props }) => (
                    <td
                      className={cn(isDark ? "px-4 py-3 text-gray-300 whitespace-pre-wrap" : "px-4 py-3 text-black whitespace-pre-wrap")}
                      {...props}
                    />
                  ),
                  // Correctly typed code block
                  code: (props) => {
                    const { children, className, node, ...rest } = props;
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <div className="border border-gray-700 rounded-md overflow-hidden my-2">
                        <div className="flex items-center justify-between bg-[#2a2a2a] px-3 py-1.5 border-b border-gray-700">
                          <span className="text-xs text-gray-400 font-mono">
                            {match[1]}
                          </span>
                        </div>
                        <code
                          {...rest}
                          className={cn(
                            "block bg-[#1e1e1e] p-3 overflow-x-auto font-mono text-sm",
                            className
                          )}
                        >
                          {children}
                        </code>
                      </div>
                    ) : (
                      <code
                        {...rest}
                        className="bg-white/10 rounded px-1.5 py-0.5 text-sm font-mono text-pink-400"
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Action Bar (Assistant Only) */}
        {!isUser && (
          <div className="flex items-center gap-4 mt-2 ml-0 text-gray-500 select-none">
            <button title="button" className="hover:text-white transition-colors p-1">
              <RotateCcw size={16} strokeWidth={1.5} />
            </button>
            <button title="button" className="hover:text-white transition-colors p-1">
              <Volume2 size={16} strokeWidth={1.5} />
            </button>
            <button title="button" className="hover:text-white transition-colors p-1 hidden sm:block">
              <MessageSquare size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={handleCopy}
              className="hover:text-white transition-colors p-1"
            >
              {copied ? (
                <Check size={16} />
              ) : (
                <Copy size={16} strokeWidth={1.5} />
              )}
            </button>
            <button title="button" className="hover:text-white transition-colors p-1 hidden sm:block">
              <Share size={16} strokeWidth={1.5} />
            </button>
            <button title="button" className="hover:text-white transition-colors p-1">
              <ThumbsUp size={16} strokeWidth={1.5} />
            </button>
            <button title="button" className="hover:text-white transition-colors p-1">
              <ThumbsDown size={16} strokeWidth={1.5} />
            </button>
            <button title="button" className="hover:text-white transition-colors p-1">
              <MoreHorizontal size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
