
import React, { useLayoutEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import gsap from "gsap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Check,
  User,
  Bot,
  Trash2,
} from "lucide-react";
import { useAppSelector } from "../../hooks/useRedux";
import SkeletonLoader from "./SkeletonLoader";

// --- TYPES ---
interface MessageProps {
  id?: string;
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
  onDelete?: (id: string) => void;
  onRegenerate?: () => void;
}

// --- SUB-COMPONENT 1: AVATAR ---
const MessageAvatar: React.FC<{ isUser: boolean; isDark: boolean }> = ({
  isUser,
  isDark,
}) => (
  <div className="shrink-0 mt-1">
    <div
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition-transform hover:scale-105 select-none",
        isUser
          ? isDark
            ? "bg-[#2F3336] border-[#2F3336] text-white"
            : "bg-white border-gray-200 text-gray-700"
          : isDark
          ? "bg-white text-black border-transparent"
          : "bg-black text-white border-transparent"
      )}
    >
      {isUser ? <User size={18} /> : <Bot size={20} />}
    </div>
  </div>
);

// --- SUB-COMPONENT 2: MARKDOWN RENDERER ---
const MessageMarkdown: React.FC<{
  content: string;
  isDark: boolean;
  isUser: boolean;
}> = ({ content, isDark, isUser }) => {
  if (isUser) {
    return (
      <p className="whitespace-pre-wrap wrap-break-words font-medium">
        {content}
      </p>
    );
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // 1. HEADINGS
        h1: ({ children }) => (
          <h1
            className={cn(
              "text-2xl font-bold mb-4 mt-6 pb-2 border-b",
              isDark ? "border-[#333] text-white" : "border-gray-300 text-black"
            )}
          >
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2
            className={cn(
              "text-xl font-bold mb-3 mt-6",
              isDark ? "text-gray-100" : "text-gray-900"
            )}
          >
            {children}
          </h2>
        ),

        // 2. PARAGRAPHS
        p: ({ children }) => (
          <p
            className={cn(
              "mb-4 last:mb-0 leading-relaxed font-normal",
              isDark ? "text-[#E7E9EA]" : "text-[#0F1419]"
            )}
          >
            {children}
          </p>
        ),

        // 3. LISTS
        ul: ({ children }) => (
          <ul
            className={cn(
              "list-disc pl-5 mb-4 space-y-1.5",
              isDark ? "marker:text-gray-500" : "marker:text-gray-400"
            )}
          >
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol
            className={cn(
              "list-decimal pl-5 mb-4 space-y-1.5 marker:font-bold",
              isDark ? "marker:text-gray-500" : "marker:text-gray-600"
            )}
          >
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="pl-1">{children}</li>,

        // 4. CODE BLOCKS
        code: ({ node, inline, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || "");

          return inline ? (
            <code
              className={cn(
                "px-1.5 py-0.5 rounded text-[13px] font-mono border mx-0.5",
                isDark
                  ? "bg-[#16181C] text-[#E7E9EA] border-[#333]"
                  : "bg-white text-[#C7254E] border-gray-300" // Standard Red for inline code in light mode
              )}
              {...props}
            >
              {children}
            </code>
          ) : (
            <div
              className={cn(
                "relative my-5 rounded-xl overflow-hidden border shadow-sm group/code",
                isDark ? "border-[#333]" : "border-gray-300"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between px-4 py-2 border-b",
                  isDark
                    ? "bg-[#16181C] border-[#333]"
                    : "bg-[#F9FAFB] border-gray-300"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-mono font-medium",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}
                >
                  {match?.[1] || "Code"}
                </span>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(String(children))
                  }
                  className={cn(
                    "flex items-center gap-1.5 text-xs transition-colors hover:cursor-pointer",
                    isDark
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-black"
                  )}
                >
                  <Copy className="hover:cursor-pointer" size={12} /> Copy
                </button>
              </div>
              <pre
                className={cn(
                  "p-4 overflow-x-auto text-[13px] font-mono leading-relaxed",
                  isDark
                    ? "bg-[#0B0B0B] text-gray-300"
                    : "bg-white text-gray-900"
                )}
                {...props}
              >
                <code>{children}</code>
              </pre>
            </div>
          );
        },

        // 5. BLOCKQUOTES
        blockquote: ({ children }) => (
          <blockquote
            className={cn(
              "border-l-4 pl-4 py-1 my-4 italic rounded-r-lg",
              isDark
                ? "border-gray-600 bg-[#16181C] text-gray-300"
                : "border-gray-300 bg-[#F9FAFB] text-gray-700"
            )}
          >
            {children}
          </blockquote>
        ),

        // 6. LINKS
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1D9BF0] hover:underline font-medium break-all hover:cursor-pointer"
          >
            {children}
          </a>
        ),

        // 7. TABLES (Improved Formatting)
        table: ({ children }) => (
          <div
            className={cn(
              "overflow-x-auto my-6 border rounded-lg shadow-sm",
              isDark ? "border-[#333]" : "border-gray-300"
            )}
          >
            <table
              className={cn("min-w-full text-left text-sm border-collapse")}
            >
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className={cn(isDark ? "bg-[#202327]" : "bg-[#F3F4F6]")}>
            {children}
          </thead>
        ),
        th: ({ children }) => (
          <th
            className={cn(
              "px-4 py-3 font-semibold border-b",
              isDark
                ? "border-[#333] text-gray-200"
                : "border-gray-300 text-gray-900"
            )}
          >
            {children}
          </th>
        ),
        tr: ({ children }) => (
          <tr
            className={cn(
              "border-b last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
              isDark ? "border-[#333]" : "border-gray-200"
            )}
          >
            {children}
          </tr>
        ),
        td: ({ children }) => (
          <td
            className={cn(
              "px-4 py-3",
              isDark ? "text-gray-300" : "text-gray-700"
            )}
          >
            {children}
          </td>
        ),
      }}
    >
      {content || "..."}
    </ReactMarkdown>
  );
};

// --- SUB-COMPONENT 3: ACTION BUTTONS ---
const MessageActions: React.FC<{
  content: string;
  isDark: boolean;
  id?: string;
  onDelete?: (id: string) => void;
  onRegenerate?: () => void;
}> = ({ content, isDark, id, onDelete, onRegenerate }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    // GSAP animation for the copy icon could go here if managed globally or via ref
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 mt-3 ml-1">
      <ActionButton
        icon={copied ? Check : Copy}
        onClick={handleCopy}
        title="Copy"
        isDark={isDark}
        active={copied}
        iconClass={copied ? "copy-btn-icon" : ""}
      />

      {onRegenerate && (
        <ActionButton
          icon={RotateCcw}
          onClick={onRegenerate}
          title="Regenerate"
          isDark={isDark}
        />
      )}

      <div
        className={cn("w-px h-3 mx-1", isDark ? "bg-gray-800" : "bg-gray-300")}
      />

      <ActionButton icon={ThumbsUp} title="Good" isDark={isDark} />
      <ActionButton icon={ThumbsDown} title="Bad" isDark={isDark} />

      {/* Bot Delete Button */}
      {onDelete && id && (
        <ActionButton
          icon={Trash2}
          onClick={() => onDelete(id)}
          title="Delete"
          isDark={isDark}
          className="hover:text-red-500 hover:bg-red-500/10"
        />
      )}
    </div>
  );
};

const ActionButton = ({
  icon: Icon,
  onClick,
  title,
  active,
  isDark,
  className,
  iconClass,
}: any) => (
  <button
    onClick={onClick}
    title={title}
    className={cn(
      "p-1.5 rounded-full transition-all duration-200 hover:scale-110 hover:cursor-pointer active:scale-95",
      active
        ? "text-green-500 bg-green-500/10"
        : isDark
        ? "text-[#71767B] hover:text-[#1D9BF0] hover:bg-[#1D9BF0]/10"
        : "text-gray-400 hover:text-[#1D9BF0] hover:bg-blue-50",
      className
    )}
  >
    <Icon size={16} strokeWidth={2} className={iconClass} />
  </button>
);

// --- MAIN COMPONENT ---
const MessageBubble: React.FC<MessageProps> = ({
  id,
  role,
  content,
  isLoading,
  onDelete,
  onRegenerate,
}) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const isDark = useAppSelector((state: any) => state.theme.isDark);
  const isUser = role === "user";

  // Entrance Animation
  useLayoutEffect(() => {
    if (bubbleRef.current && gsap) {
      gsap.fromTo(
        bubbleRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <div
      ref={bubbleRef}
      className={cn(
        "flex w-full mb-8 relative group",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[95%] md:max-w-[85%] gap-4",
          isUser ? "flex-row-reverse" : "flex-row"
        )}
      >
        {/* 1. Avatar */}
        <MessageAvatar isUser={isUser} isDark={isDark} />

        <div
          className={cn(
            "flex flex-col min-w-0 w-full",
            isUser ? "items-end" : "items-start"
          )}
        >
          {isLoading ? (
            <div className="space-y-3 w-full max-w-md mt-2 animate-pulse">
              <SkeletonLoader className="h-4 w-3/4 rounded-full bg-gray-300 dark:bg-gray-700" />
              <SkeletonLoader className="h-4 w-1/2 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>
          ) : (
            <>
              {/* 2. Content Bubble */}
              <div
                className={cn(
                  "text-[15px] leading-7 w-full overflow-hidden relative",
                  isUser
                    ? cn(
                        "px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm",
                        isDark
                          ? "bg-[#2F3336] text-[#E7E9EA]"
                          : "bg-[#F3F4F6] text-[#111827]"
                      )
                    : cn(
                        "px-1 py-0 bg-transparent",
                        isDark ? "text-[#E7E9EA]" : "text-[#0F1419]"
                      )
                )}
              >
                {/* User Delete Button (Absolute Position) */}
                {isUser && onDelete && id && (
                  <button
                    onClick={() => onDelete(id)}
                    className="absolute -left-8 top-1 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Message"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                <MessageMarkdown
                  content={content}
                  isDark={isDark}
                  isUser={isUser}
                />
              </div>

              {/* 3. Bot Actions */}
              {!isUser && (
                <MessageActions
                  content={content}
                  isDark={isDark}
                  id={id}
                  onDelete={onDelete}
                  onRegenerate={onRegenerate}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
