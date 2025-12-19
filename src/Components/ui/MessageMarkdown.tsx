import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "../../lib/utils";
import { Copy } from "lucide-react";

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

        // 2. PARAGRAPHS - FIX: Added whitespace-pre-wrap to preserve newlines
        p: ({ children }) => (
          <p
            className={cn(
              "mb-4 last:mb-0 leading-relaxed font-normal whitespace-pre-wrap",
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

export default MessageMarkdown;
