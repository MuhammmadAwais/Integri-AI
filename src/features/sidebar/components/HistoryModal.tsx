import React, { useState } from "react";
import {
  X,
  Search,
  MessageSquare,
  Calendar,
  ChevronLeft,
  User,
  Bot,
  Copy,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatList, useMessages } from "../../chat/hooks/useChat";
import { useAppSelector } from "../../../hooks/useRedux";
import { cn } from "../../../lib/utils";
import SkeletonLoader from "../../../Components/ui/SkeletonLoader";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const user = useAppSelector((state: any) => state.auth.user);
  const isDark = useAppSelector((state: any) => state.theme.isDark);

  // 1. Fetch All Chats
  const { chats = [] } = useChatList(user?.id);

  // 2. Fetch Messages for Preview
  const { messages: previewMessages = [], loading: isPreviewLoading } =
    useMessages(user?.id, selectedChatId || undefined);

  if (!isOpen) return null;

  const filteredChats = chats.filter((c) =>
    (c.title || "New Chat").toLowerCase().includes(search.toLowerCase())
  );

  const handleBackToList = () => {
    setSelectedChatId(null);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full h-full md:h-[85vh] md:max-w-5xl md:rounded-2xl flex overflow-hidden shadow-2xl relative transition-colors",
          isDark
            ? "bg-[#090909] border-[#222] md:border"
            : "bg-white border-gray-200 md:border"
        )}
      >
        {/* Close Button */}
        <button
          title="Close"
          onClick={onClose}
          className="absolute top-3 right-3 z-50 p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={20} className={isDark ? "text-gray-400" : "text-gray-600"} />
        </button>

        {/* ================= LEFT SIDE: CHAT LIST ================= */}
        <div
          className={cn(
            "flex-col w-full md:w-[350px] shrink-0 border-r transition-all duration-300",
            isDark ? "border-[#222]" : "border-gray-200",
            selectedChatId ? "hidden md:flex" : "flex"
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-transparent shrink-0">
            <h2
              className={cn(
                "text-lg font-bold mb-3 px-1",
                isDark ? "text-white" : "text-gray-900"
              )}
            >
              History
            </h2>
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all",
                isDark
                  ? "bg-[#161616] border-transparent focus-within:bg-black focus-within:border-[#333]"
                  : "bg-gray-100 border-transparent focus-within:bg-white focus-within:border-gray-300"
              )}
            >
              <Search size={16} className="text-gray-500" />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                className={cn(
                  "bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-500",
                  isDark ? "text-white" : "text-black"
                )}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2 mt-1">
              Recent
            </div>

            {filteredChats.length === 0 ? (
              <div className="px-4 text-sm text-gray-500 mt-4">
                No results found.
              </div>
            ) : (
              filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id)}
                  className={cn(
                    "w-full text-left px-3 py-3 rounded-lg text-sm transition-colors mb-1 flex items-center gap-3 group relative hover:cursor-pointer",
                    selectedChatId === chat.id
                      ? isDark
                        ? "bg-[#1F1F1F] text-white"
                        : "bg-gray-200 text-black"
                      : isDark
                      ? "hover:bg-[#161616] text-gray-400"
                      : "hover:bg-gray-100 text-gray-700"
                  )}
                >
                  <MessageSquare
                    size={16}
                    className={cn(
                      "shrink-0",
                      selectedChatId === chat.id ? "opacity-100" : "opacity-50"
                    )}
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate font-medium">
                      {chat.title || "New Conversation"}
                    </div>
                    <div className="text-[10px] opacity-40 truncate">
                      {chat.updatedAt
                        ? new Date(
                            chat.updatedAt.seconds * 1000
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </div>
                  </div>
                  <div className="md:hidden text-gray-500">
                    <ChevronLeft size={16} className="rotate-180" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ================= RIGHT SIDE: PREVIEW ================= */}
        <div
          className={cn(
            "flex-col flex-1 relative transition-all duration-300",
            isDark ? "bg-black/20" : "bg-gray-50/50",
            !selectedChatId ? "hidden md:flex" : "flex"
          )}
        >
          {selectedChatId ? (
            <>
              {/* Preview Header */}
              <div
                className={cn(
                  "px-4 md:px-6 py-4 border-b flex items-center justify-between shrink-0 pr-12 backdrop-blur-md z-10 sticky top-0",
                  isDark
                    ? "border-[#222] bg-[#090909]/80"
                    : "border-gray-200 bg-white/80"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <button
                    title="Back to Chat List"
                    onClick={handleBackToList}
                    className={cn(
                      "md:hidden p-1.5 rounded-full mr-1 transition-colors",
                      isDark
                        ? "hover:bg-[#333] text-gray-300"
                        : "hover:bg-gray-200 text-gray-700"
                    )}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="overflow-hidden">
                    <h3
                      className={cn(
                        "font-bold text-lg truncate",
                        isDark ? "text-gray-100" : "text-gray-900"
                      )}
                    >
                      {filteredChats.find((c) => c.id === selectedChatId)
                        ?.title || "Chat Preview"}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Calendar size={12} />
                      <span>
                        Started{" "}
                        {(() => {
                          const c = filteredChats.find(
                            (c) => c.id === selectedChatId
                          );
                          return c?.updatedAt
                            ? new Date(
                                c.updatedAt.seconds * 1000
                              ).toLocaleDateString()
                            : "N/A";
                        })()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
                {isPreviewLoading ? (
                  <div className="space-y-4 max-w-2xl mx-auto pt-10">
                    <SkeletonLoader className="h-16 w-3/4 rounded-xl opacity-20" />
                    <SkeletonLoader className="h-24 w-full rounded-xl opacity-20" />
                    <SkeletonLoader className="h-16 w-2/3 rounded-xl opacity-20" />
                  </div>
                ) : previewMessages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    No messages yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-10">
                    {previewMessages.map((msg: any) => {
                      const isUser = msg.role === "user";
                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex w-full relative group",
                            isUser ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "flex max-w-[95%] md:max-w-[85%] gap-4",
                              isUser ? "flex-row-reverse" : "flex-row"
                            )}
                          >
                            {/* Avatar */}
                            <div className="shrink-0 mt-1">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center shadow-sm border transition-transform select-none",
                                  isUser
                                    ? isDark
                                      ? "bg-[#2F3336] border-[#2F3336] text-white"
                                      : "bg-white border-gray-200 text-gray-700"
                                    : isDark
                                    ? "bg-white text-black border-transparent"
                                    : "bg-black text-white border-transparent"
                                )}
                              >
                                {isUser ? (
                                  <User size={16} />
                                ) : (
                                  <Bot size={18} />
                                )}
                              </div>
                            </div>

                            {/* Content */}
                            <div
                              className={cn(
                                "flex flex-col min-w-0 w-full",
                                isUser ? "items-end" : "items-start"
                              )}
                            >
                              <div
                                className={cn(
                                  "text-[14px] md:text-[15px] leading-7 w-full overflow-hidden",
                                  isUser
                                    ? cn(
                                        "px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm",
                                        isDark
                                          ? "bg-[#2F3336] text-[#E7E9EA]"
                                          : "bg-[#F3F4F6] text-[#111827]"
                                      )
                                    : cn(
                                        "px-1 py-0 bg-transparent",
                                        isDark
                                          ? "text-[#E7E9EA]"
                                          : "text-[#0F1419]"
                                      )
                                )}
                              >
                                {isUser ? (
                                  <p className="whitespace-pre-wrap wrap-break-words font-medium">
                                    {msg.content}
                                  </p>
                                ) : (
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      // Minimalist Markdown Components for History
                                      h1: ({ children }) => (
                                        <h1 className="text-xl font-bold mb-2 mt-4 pb-1 border-b opacity-80">
                                          {children}
                                        </h1>
                                      ),
                                      h2: ({ children }) => (
                                        <h2 className="text-lg font-bold mb-2 mt-4 opacity-90">
                                          {children}
                                        </h2>
                                      ),
                                      p: ({ children }) => (
                                        <p className="mb-3 last:mb-0 leading-relaxed">
                                          {children}
                                        </p>
                                      ),
                                      ul: ({ children }) => (
                                        <ul className="list-disc pl-5 mb-3 space-y-1">
                                          {children}
                                        </ul>
                                      ),
                                      ol: ({ children }) => (
                                        <ol className="list-decimal pl-5 mb-3 space-y-1">
                                          {children}
                                        </ol>
                                      ),
                                      code: ({
                                        node,
                                        inline,
                                        className,
                                        children,
                                        ...props
                                      }: any) => {
                                        return inline ? (
                                          <code
                                            className={cn(
                                              "px-1 py-0.5 rounded text-xs font-mono border mx-0.5",
                                              isDark
                                                ? "bg-[#16181C] border-[#333]"
                                                : "bg-white border-gray-200"
                                            )}
                                            {...props}
                                          >
                                            {children}
                                          </code>
                                        ) : (
                                          <div
                                            className={cn(
                                              "relative my-3 rounded-lg overflow-hidden border shadow-sm",
                                              isDark
                                                ? "border-[#333] bg-[#16181C]"
                                                : "border-gray-200 bg-gray-50"
                                            )}
                                          >
                                            <div className="flex items-center justify-between px-3 py-1.5 border-b border-inherit">
                                              <span className="text-[10px] uppercase font-mono opacity-50">
                                                Code
                                              </span>
                                              <button
                                                onClick={() =>
                                                  handleCopy(
                                                    String(children),
                                                    msg.id
                                                  )
                                                }
                                                className="opacity-50 hover:opacity-100 transition-opacity"
                                              >
                                                {copiedId === msg.id ? (
                                                  <Check
                                                    size={12}
                                                    className="text-green-500"
                                                  />
                                                ) : (
                                                  <Copy size={12} />
                                                )}
                                              </button>
                                            </div>
                                            <pre className="p-3 overflow-x-auto text-xs font-mono">
                                              <code>{children}</code>
                                            </pre>
                                          </div>
                                        );
                                      },
                                      a: ({ href, children }) => (
                                        <a
                                          href={href}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-500 hover:underline"
                                        >
                                          {children}
                                        </a>
                                      ),
                                    }}
                                  >
                                    {msg.content}
                                  </ReactMarkdown>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-30 select-none">
              <MessageSquare size={48} className="mb-4" />
              <p className="text-lg font-medium">
                Select a conversation to preview
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
