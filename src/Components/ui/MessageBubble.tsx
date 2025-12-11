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
} from "lucide-react";
import { useAppSelector } from "../../hooks/useRedux"; //
import SkeletonLoader from "./SkeletonLoader";
interface MessageProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean; // Controls the Skeleton state
}
const MessageBubble: React.FC<MessageProps> = ({
  role,
  content,
  isLoading,
}) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const isDark = useAppSelector((state: any) => state.theme.isDark);
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
  // Copy Handler with Feedback Animation
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    // Quick scale "pop" animation for the icon
    gsap.fromTo(
      ".copy-btn-icon",
      { scale: 0.5 },
      { scale: 1, duration: 0.3, ease: "back.out(1.7)" }
    );
    setTimeout(() => setCopied(false), 2000);
  };
  const isUser = role === "user";
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
        {/* --- AVATAR --- */}
        <div className="shrink-0 mt-1">
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center shadow-sm border transition-transform hover:scale-105 select-none",
              isUser
                ? // User: Dark Gray (Dark) / White (Light)
                  isDark
                  ? "bg-[#2F3336] border-[#2F3336] text-white"
                  : "bg-white border-gray-200 text-gray-700"
                : // AI: White (Dark) / Black (Light) -> Grok Style
                isDark
                ? "bg-white text-black border-transparent"
                : "bg-black text-white border-transparent"
            )}
          >
            {isUser ? <User size={18} /> : <Bot size={20} />}
          </div>
        </div>
        {/* --- CONTENT AREA --- */}
        <div
          className={cn(
            "flex flex-col min-w-0 w-full",
            isUser ? "items-end" : "items-start"
          )}
        >
          {/* LOADING STATE SKELETON */}
          {isLoading ? (
            <div className="space-y-3 w-full max-w-md mt-2 animate-pulse">
              <SkeletonLoader className="h-4 w-3/4 rounded-full bg-gray-300 dark:bg-gray-700" />
              <SkeletonLoader className="h-4 w-1/2 rounded-full bg-gray-300 dark:bg-gray-700" />
              <SkeletonLoader className="h-4 w-5/6 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>
          ) : (
            <>
              {/* TEXT CONTAINER */}
              <div
                className={cn(
                  "text-[15px] leading-7 w-full overflow-hidden",
                  // USER: Visible Bubble
                  isUser
                    ? cn(
                        "px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm",
                        isDark
                          ? "bg-[#2F3336] text-[#E7E9EA]" // Dark Mode
                          : "bg-[#F3F4F6] text-[#111827]" // Light Mode
                      )
                    : // AI: Transparent Background (Grok Style)
                      cn(
                        "px-1 py-0 bg-transparent",
                        isDark ? "text-[#E7E9EA]" : "text-[#0F1419]"
                      )
                )}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap wrap-break-words font-medium">
                    {content}
                  </p>
                ) : (
                  // --- AI MARKDOWN RENDERER ---
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // 1. HEADINGS
                      h1: ({ children }) => (
                        <h1
                          className={cn(
                            "text-2xl font-bold mb-4 mt-6 pb-2 border-b",
                            isDark
                              ? "border-[#333] text-white"
                              : "border-gray-300 text-black"
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
                            isDark
                              ? "marker:text-gray-500"
                              : "marker:text-gray-400"
                          )}
                        >
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol
                          className={cn(
                            "list-decimal pl-5 mb-4 space-y-1.5 marker:font-bold",
                            isDark
                              ? "marker:text-gray-500"
                              : "marker:text-gray-600"
                          )}
                        >
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="pl-1">{children}</li>
                      ),

                      // 4. CODE BLOCKS
                      code: ({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }: any) => {
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
                                  navigator.clipboard.writeText(
                                    String(children)
                                  )
                                }
                                className={cn(
                                  "flex items-center gap-1.5 text-xs transition-colors hover:cursor-pointer",
                                  isDark
                                    ? "text-gray-400 hover:text-white"
                                    : "text-gray-600 hover:text-black"
                                )}
                              >
                                <Copy size={12} /> Copy
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
                            className={cn(
                              "min-w-full text-left text-sm border-collapse"
                            )}
                          >
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead
                          className={cn(
                            isDark ? "bg-[#202327]" : "bg-[#F3F4F6]"
                          )}
                        >
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
                )}
              </div>

              {/* --- ACTION BAR --- */}
              {!isUser && (
                <div className="flex items-center gap-2 mt-3 ml-1">
                  <button
                    onClick={handleCopy}
                    className={cn(
                      "p-1.5 rounded-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#2F3336]",
                      copied
                        ? "text-green-500"
                        : isDark
                        ? "text-[#71767B] hover:text-[#1D9BF0]"
                        : "text-gray-400 hover:text-[#1D9BF0]"
                    )}
                    title="Copy"
                  >
                    {copied ? (
                      <Check size={16} className="copy-btn-icon" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>

                  <ActionButton
                    icon={RotateCcw}
                    title="Regenerate"
                    isDark={isDark}
                  />

                  <div
                    className={cn(
                      "w-px h-3 mx-1",
                      isDark ? "bg-gray-800" : "bg-gray-300"
                    )}
                  />

                  <ActionButton icon={ThumbsUp} title="Good" isDark={isDark} />
                  <ActionButton icon={ThumbsDown} title="Bad" isDark={isDark} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- HELPER ACTION BUTTON ---
const ActionButton = ({ icon: Icon, onClick, title, active, isDark }: any) => (
  <button
    onClick={onClick}
    title={title}
    className={cn(
      "p-1.5 rounded-full transition-all duration-200 hover:scale-110 hover:cursor-pointer active:scale-95",
      active
        ? "text-green-500 bg-green-500/10"
        : isDark
        ? "text-[#71767B] hover:text-[#1D9BF0] hover:bg-[#1D9BF0]/10"
        : "text-gray-400 hover:text-[#1D9BF0] hover:bg-blue-50"
    )}
  >
    <Icon size={16} strokeWidth={2} />
  </button>
);

export default MessageBubble;
