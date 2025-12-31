import React from "react";
import {
  X,
  ChevronLeft,
  ExternalLink,
  Trash2,
  User,
  Bot,
  MessageSquare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SkeletonLoader from "../../../Components/ui/SkeletonLoader";
import { cn } from "../../../lib/utils";
import { getSessionId } from "./HistoryModal";

interface Props {
  chats: any[];
  selectedChatId: string | null;
  messages: any[];
  loading: boolean;
  isDark: boolean;
  mobileView: "list" | "detail";
  onBack: () => void;
  onDelete: (id: string) => void;
  onOpenChat: (id: string) => void;
  onClose: () => void;
}

const HistoryPreview: React.FC<Props> = ({
  chats,
  selectedChatId,
  messages,
  loading,
  isDark,
  mobileView,
  onBack,
  onDelete,
  onOpenChat,
  onClose,
}) => {
  console.log("📩 PREVIEW MESSAGES:", messages);

  return (
    <div
      className={cn(
        "flex flex-col h-full relative",
        mobileView === "list"
          ? "hidden md:flex md:flex-1"
          : "flex w-full fixed inset-0 md:static md:flex-1"
      )}
    >
      {/* HEADER */}
      <div
        className={cn(
          "h-[60px] flex items-center justify-between px-4 border-b shrink-0",
          isDark ? "border-[#2A2B32]" : "border-gray-200"
        )}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            title="button"
            onClick={onBack}
            className="md:hidden p-2 -ml-2"
          >
            <ChevronLeft size={24} />
          </button>
          <h3 className="font-bold truncate text-sm md:text-base">
            {chats.find((c: any) => getSessionId(c) === selectedChatId)
              ?.title || "Preview"}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {selectedChatId && (
            <>
              <button
                className="hover:cursor-pointer"
                title="delete"
                onClick={() => onDelete(selectedChatId)}
              >
                <Trash2
                  className="hover:cursor-pointer p-1 rounded-b-sm hover:bg-red-400"
                  size={22}
                />
              </button>
              <button
                className="hover:cursor-pointer"
                title="link"
                onClick={() => onOpenChat(selectedChatId)}
              >
                <ExternalLink size={18} />
              </button>
            </>
          )}
          <button
            className="hover:cursor-pointer"
            title="close"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        {!selectedChatId ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30">
            <MessageSquare size={40} />
            <p>Select a conversation</p>
          </div>
        ) : loading ? (
          <SkeletonLoader className="h-20 w-full rounded-xl" />
        ) : messages.length === 0 ? (
          <div className="text-center opacity-50 py-20">No messages found.</div>
        ) : (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            {messages.map((msg, idx) => {
              console.log("🧾 MESSAGE CONTENT:", msg.content);

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex w-full",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {/* AVATAR */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                        msg.role === "user"
                          ? "bg-indigo-600 text-white"
                          : isDark
                          ? "bg-gray-700 text-white"
                          : "bg-black text-white"
                      )}
                    >
                      {msg.role === "user" ? (
                        <User size={14} />
                      ) : (
                        <Bot size={14} />
                      )}
                    </div>

                    {/* MESSAGE BUBBLE */}
                    <div
                      className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-normal wrap-break-words line-clamp-none block overflow-visible max-h-none[webkit-line-clamp:unset] [webkit-box-orient:unset]",
                        msg.role === "user"
                          ? isDark
                            ? "bg-[#2F3336] text-gray-100"
                            : "bg-gray-200 text-gray-900"
                          : isDark? "bg-transparent text-gray-800 dark:text-gray-200" : "bg-gray-100 text-gray-900"
                      )}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ node, ...props }) => (
                            <p
                              {...props}
                              className="block whitespace-normal wrap-break-words line-clamp-none"
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li
                              {...props}
                              className="whitespace-normal wrap-break-words"
                            />
                          ),
                          pre: ({ node, ...props }) => (
                            <pre
                              {...props}
                              className="overflow-x-auto rounded-lg p-3 my-3 text-xs bg-black/80 text-white"
                            />
                          ),
                          code: ({ node, ...props }) => (
                            <code
                              {...props}
                              className="bg-black/20 px-1 py-0.5 rounded text-xs"
                            />
                          ),
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-3">
                              <table
                                {...props}
                                className="border-collapse border border-gray-500 text-xs"
                              />
                            </div>
                          ),
                        }}
                      >
                        {(msg.content || "")}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}

            
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPreview;
